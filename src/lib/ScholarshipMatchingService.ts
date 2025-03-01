// src/lib/scholarshipMatchingService.ts
import { supabase } from './supabase';
import type { Scholarship, UserProfile, ScoredScholarship } from '../types';

// Define STEM majors for special matching
const STEM_MAJORS = [
  'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Information Technology', 'Data Science', 'Statistics',
  'Biochemistry', 'Environmental Science', 'Neuroscience', 'Robotics', 'Cybersecurity'
];

// Define Business majors for special matching
const BUSINESS_MAJORS = [
  'Business', 'Finance', 'Accounting', 'Economics', 'Marketing',
  'Management', 'Entrepreneurship', 'Business Administration'
];

// Define major categories for better matching
const MAJOR_CATEGORIES: Record<string, string[]> = {
  'STEM': STEM_MAJORS,
  'Business': BUSINESS_MAJORS,
  // Add more categories as needed
};

// Check if a major belongs to a category
function isMajorInCategory(major: string, category: string): boolean {
  const categoryMajors = MAJOR_CATEGORIES[category];
  if (!categoryMajors) return false;
  
  const normalizedMajor = major.toLowerCase();
  return categoryMajors.some(categoryMajor => {
    const normalizedCategoryMajor = categoryMajor.toLowerCase();
    return normalizedMajor.includes(normalizedCategoryMajor) || 
           normalizedCategoryMajor.includes(normalizedMajor);
  });
}

// Stage 1: Get initial scholarship matches from the database
async function getInitialScholarshipMatches(userProfile: UserProfile): Promise<Scholarship[]> {
  try {
    // Try to use the database function if available
    const { data: fnData, error: fnError } = await supabase.rpc(
      'match_scholarships',
      {
        user_education: userProfile.education_level,
        user_gpa: userProfile.gpa,
        user_location: userProfile.location,
        user_major: userProfile.major,
        limit_count: 100
      }
    );

    if (!fnError && fnData) {
      return fnData;
    }

    // Fallback to direct query if function fails
    console.log('Falling back to direct query');
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .or(`gpa_requirement.is.null,gpa_requirement.lte.${userProfile.gpa}`)
      .or(`education_level.cs.{${userProfile.education_level}},education_level.is.null`)
      .or(`state.eq.${userProfile.location},national.eq.true,state.is.null`)
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in database filtering:', error);
    
    // Last resort fallback - get all scholarships
    const { data: allData } = await supabase
      .from('scholarships')
      .select('*')
      .limit(100);
    
    return allData || [];
  }
}

// Stage 2: Calculate detailed match score
function calculateScholarshipScore(scholarship: Scholarship, userProfile: UserProfile): number {
  let score = 100; // Start with perfect score and deduct/add points

  // Education Level Match (0-25 points)
  if (Array.isArray(scholarship.education_level) && 
      scholarship.education_level.includes(userProfile.education_level)) {
    score += 25;
  } else if (!scholarship.education_level) {
    score += 15; // Some bonus for no requirements
  } else {
    score -= 25; // Penalty for mismatch
  }

  // Location Match (0-20 points)
  if (scholarship.national || !scholarship.state) {
    score += 10; // National scholarships are good
  } else if (scholarship.state === userProfile.location) {
    score += 20; // Local match is better
  } else {
    score -= 20; // Wrong state is a significant penalty
  }

  // School Match if specified (0-25 points)
  if (scholarship.school) {
    if (scholarship.school.toLowerCase() === userProfile.school.toLowerCase()) {
      score += 25; // School-specific match is excellent
    } else {
      score -= 25; // Wrong school is a significant penalty
    }
  }

  // Major Match (0-30 points)
  if (!scholarship.major) {
    score += 15; // No specific major required
  } else if (scholarship.major.toLowerCase() === userProfile.major.toLowerCase()) {
    score += 30; // Direct major match
  } else if (scholarship.major === 'STEM' && isMajorInCategory(userProfile.major, 'STEM')) {
    score += 25; // STEM category match
  } else if (scholarship.major === 'Business' && isMajorInCategory(userProfile.major, 'Business')) {
    score += 25; // Business category match
  } else {
    score -= 30; // Wrong major is a significant penalty
  }

  // GPA Score (0-25 points)
  if (!scholarship.gpa_requirement) {
    score += 15; // No GPA requirement
  } else {
    const gpaBuffer = userProfile.gpa - scholarship.gpa_requirement;
    if (gpaBuffer >= 0) {
      // Add points based on how much they exceed the requirement (up to 25)
      score += Math.min(15 + (gpaBuffer * 10), 25);
    } else {
      score -= 100; // They don't meet the requirement, this should eliminate it
    }
  }

  // Amount Factor (0-20 points)
  const amountScore = Math.min(20, (scholarship.amount / 10000) * 20);
  score += amountScore;

  // Competition Level Adjustment (-10 to +10 points)
  switch (scholarship.competition_level) {
    case 'Low':
      score += 10;
      break;
    case 'Medium':
      score += 5;
      break;
    case 'High':
      score -= 5;
      break;
  }

  // Is Pell Grant eligible special case
  if (scholarship.is_pell_eligible && userProfile.is_pell_eligible) {
    score += 15;
  } else if (scholarship.is_pell_eligible && !userProfile.is_pell_eligible) {
    score -= 100; // They don't qualify, eliminate it
  }

  // Deadline Proximity Factor (-10 to +10 points)
  if (scholarship.deadline) {
    const daysUntilDeadline = Math.ceil(
      (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline <= 0) {
      score -= 100; // Past deadline, eliminate it
    } else if (daysUntilDeadline <= 7) {
      score += 10; // Very urgent
    } else if (daysUntilDeadline <= 30) {
      score += 5; // Somewhat urgent
    } else if (daysUntilDeadline > 120) {
      score -= 5; // Far off
    }
  }

  // Normalize final score to 0-100 range with a floor of 0
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Stage 3: Apply business rules and diversity
function applyBusinessRules(scoredScholarships: ScoredScholarship[]): ScoredScholarship[] {
  // Group by provider
  const byProvider: Record<string, ScoredScholarship[]> = {};
  
  for (const scholarship of scoredScholarships) {
    const provider = scholarship.provider || 'Unknown';
    if (!byProvider[provider]) {
      byProvider[provider] = [];
    }
    byProvider[provider].push(scholarship);
  }
  
  // Diversify results by limiting scholarships per provider
  const diverseResults: ScoredScholarship[] = [];
  const providerLimit = 3; // Maximum scholarships per provider
  
  // First pass: add the best scholarship from each provider
  Object.values(byProvider).forEach(scholarships => {
    if (scholarships.length > 0) {
      diverseResults.push(scholarships[0]);
    }
  });
  
  // Second pass: fill in remaining scholarships up to provider limit
  Object.values(byProvider).forEach(scholarships => {
    if (scholarships.length > 1) {
      const remaining = scholarships.slice(1, providerLimit);
      diverseResults.push(...remaining);
    }
  });
  
  // Final sort by score
  return diverseResults.sort((a, b) => b.score - a.score);
}

// Main function to get matched scholarships
export async function getMatchedScholarships(userProfile: UserProfile): Promise<ScoredScholarship[]> {
  try {
    // Stage 1: Get initial matches from database
    const initialMatches = await getInitialScholarshipMatches(userProfile);
    
    if (initialMatches.length === 0) {
      console.log('No initial matches found');
      return [];
    }
    
    // Stage 2: Score each scholarship
    const scoredMatches: ScoredScholarship[] = initialMatches
      .map(scholarship => ({
        ...scholarship,
        score: calculateScholarshipScore(scholarship, userProfile)
      }))
      .filter(scholarship => scholarship.score > 0) // Remove any with score of 0
      .sort((a, b) => b.score - a.score);
    
    // Stage 3: Apply business rules for diversity
    const finalMatches = applyBusinessRules(scoredMatches);
    
    return finalMatches.slice(0, 20); // Return top 20 matches
  } catch (error) {
    console.error('Error getting matched scholarships:', error);
    return [];
  }
}

// Function to update scholarship popularity when viewed or saved
export async function incrementScholarshipPopularity(scholarshipId: string): Promise<void> {
  try {
    await supabase.rpc('increment_scholarship_popularity', { scholarship_id: scholarshipId });
  } catch (error) {
    console.error('Error updating scholarship popularity:', error);
  }
}