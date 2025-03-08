// src/lib/scoring.ts
import type { Scholarship, UserProfile, ScoredScholarship } from '../types';

// Define major categories for better matching
interface MajorCategories {
  [category: string]: string[];
}

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

// Define Arts & Humanities majors
const ARTS_HUMANITIES_MAJORS = [
  'Art', 'Design', 'Music', 'Theater', 'Dance', 'Literature', 'English',
  'Philosophy', 'History', 'Linguistics', 'Languages', 'Communications'
];

// Define Health & Medicine majors
const HEALTH_MAJORS = [
  'Nursing', 'Medicine', 'Pharmacy', 'Public Health', 'Nutrition',
  'Kinesiology', 'Physical Therapy', 'Occupational Therapy', 'Healthcare'
];

// Define Social Sciences majors
const SOCIAL_SCIENCES_MAJORS = [
  'Psychology', 'Sociology', 'Anthropology', 'Political Science',
  'International Relations', 'Criminal Justice', 'Social Work'
];

// Organize into categories
const MAJOR_CATEGORIES: MajorCategories = {
  'STEM': STEM_MAJORS,
  'Business': BUSINESS_MAJORS,
  'Arts & Humanities': ARTS_HUMANITIES_MAJORS,
  'Health & Medicine': HEALTH_MAJORS,
  'Social Sciences': SOCIAL_SCIENCES_MAJORS
};

/**
 * Check if a major belongs to a specific category
 */
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

/**
 * Calculate a match score between a scholarship and user profile
 * Returns a score from 0-100
 */
export function calculateScholarshipScore(scholarship: Scholarship, userProfile: UserProfile): number {
  // Start with a neutral score
  let score = 50;
  let hasEssentialMismatch = false;
  
  // === ESSENTIAL CRITERIA (disqualifiers if mismatched) ===
  
  // GPA Requirement - Essential criterion
  if (scholarship.gpa_requirement && userProfile.gpa < scholarship.gpa_requirement) {
    hasEssentialMismatch = true;
  }
  
  // Pell Grant Eligibility - Essential criterion if specified
  if (scholarship.is_pell_eligible === true && userProfile.is_pell_eligible === false) {
    hasEssentialMismatch = true;
  }
  
  // Deadline passed - Essential criterion
  if (scholarship.deadline) {
    const deadlineDate = new Date(scholarship.deadline);
    const today = new Date();
    if (deadlineDate < today) {
      hasEssentialMismatch = true;
    }
  }
  
  // Quick exit if essential criteria don't match
  if (hasEssentialMismatch) {
    return 0;
  }
  
  // === WEIGHTED SCORING CRITERIA ===
  
  // EDUCATION LEVEL MATCH (0-25 points)
  if (Array.isArray(scholarship.education_level) && 
      scholarship.education_level.includes(userProfile.education_level)) {
    // Perfect education level match
    score += 25;
  } else if (!scholarship.education_level || scholarship.education_level.length === 0) {
    // No specific education level required
    score += 15;
  } else {
    // Education level mismatch (slight penalty)
    score -= 15;
  }
  
  // LOCATION MATCH (0-20 points)
  if (scholarship.state === userProfile.location) {
    // Local scholarship match (highest value)
    score += 20;
  } else if (scholarship.national || !scholarship.state) {
    // National scholarship (good but not as good as local match)
    score += 10;
  } else {
    // Wrong state (penalty)
    score -= 15;
  }
  
  // MAJOR MATCH (0-30 points)
  if (!scholarship.major) {
    // No specific major required
    score += 15;
  } else if (scholarship.major.toLowerCase() === userProfile.major.toLowerCase()) {
    // Direct major match
    score += 30;
  } else {
    // Check for category matches (e.g., "STEM" with "Computer Science")
    let categoryMatch = false;
    
    for (const category in MAJOR_CATEGORIES) {
      if (scholarship.major === category && isMajorInCategory(userProfile.major, category)) {
        score += 25; // Good category match
        categoryMatch = true;
        break;
      }
    }
    
    if (!categoryMatch) {
      // Wrong major (significant penalty)
      score -= 20;
    }
  }
  
  // GPA SCORE (0-25 points)
  if (scholarship.gpa_requirement) {
    const gpaBuffer = userProfile.gpa - scholarship.gpa_requirement;
    if (gpaBuffer >= 0) {
      // Add points based on how much they exceed the requirement
      score += Math.min(10 + (gpaBuffer * 15), 25);
    }
  } else {
    // No GPA requirement is good
    score += 10;
  }
  
  // AMOUNT FACTOR (0-20 points)
  // Scale based on amount, with diminishing returns for very large amounts
  if (scholarship.amount) {
    if (scholarship.amount <= 1000) {
      score += 5;
    } else if (scholarship.amount <= 5000) {
      score += 10;
    } else if (scholarship.amount <= 10000) {
      score += 15;
    } else {
      score += 20;
    }
  }
  
  // COMPETITION LEVEL ADJUSTMENT (-10 to +10 points)
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
  
  // DEADLINE PROXIMITY FACTOR (-10 to +15 points)
  if (scholarship.deadline) {
    const daysUntilDeadline = Math.ceil(
      (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilDeadline <= 7) {
      score += 15; // Very urgent, high priority
    } else if (daysUntilDeadline <= 30) {
      score += 10; // Approaching deadline
    } else if (daysUntilDeadline <= 90) {
      score += 5; // Medium-term deadline
    } else if (daysUntilDeadline > 180) {
      score -= 5; // Very far off deadline
    }
  }
  
  // RECURRING SCHOLARSHIP BONUS (0-10 points)
  if (scholarship.is_recurring) {
    score += 10; // Bonus for recurring scholarships
  }
  
  // ROI SCORE ADJUSTMENT (0-15 points)
  if (scholarship.roi_score) {
    score += Math.min(15, scholarship.roi_score / 10);
  }
  
  // POPULARITY BONUS (0-10 points)
  if (scholarship.popularity) {
    // Popular scholarships get a small boost
    score += Math.min(10, scholarship.popularity / 10);
  }
  
  // Normalize final score to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Apply business rules to ensure diversity in results
 */
export function diversifyResults(scoredScholarships: ScoredScholarship[]): ScoredScholarship[] {
  // Group scholarships by provider
  const byProvider: Record<string, ScoredScholarship[]> = {};
  
  for (const scholarship of scoredScholarships) {
    const provider = scholarship.provider || 'Unknown';
    if (!byProvider[provider]) {
      byProvider[provider] = [];
    }
    byProvider[provider].push(scholarship);
  }
  
  // Rebalance results to limit over-representation by any single provider
  const diverseResults: ScoredScholarship[] = [];
  const maxPerProvider = 3; // Maximum scholarships per provider
  
  // First pass: add the best scholarship from each provider
  Object.values(byProvider).forEach(scholarships => {
    if (scholarships.length > 0) {
      // Sort by score and take the highest
      const sorted = [...scholarships].sort((a, b) => b.score - a.score);
      diverseResults.push(sorted[0]);
    }
  });
  
  // Second pass: fill in remaining scholarships up to provider limit
  Object.values(byProvider).forEach(scholarships => {
    if (scholarships.length > 1) {
      // Sort by score
      const sorted = [...scholarships].sort((a, b) => b.score - a.score);
      // Skip the first one (already added) and take up to the limit
      const remaining = sorted.slice(1, maxPerProvider);
      diverseResults.push(...remaining);
    }
  });
  
  // Ensure we have the best overall matches regardless of provider
  const bestOverall = [...scoredScholarships]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  
  // Combine and de-duplicate
  const combined = [...diverseResults, ...bestOverall];
  const uniqueIds = new Set<string>();
  const uniqueResults = combined.filter(scholarship => {
    if (uniqueIds.has(scholarship.id)) {
      return false;
    }
    uniqueIds.add(scholarship.id);
    return true;
  });
  
  // Final sort by score
  return uniqueResults.sort((a, b) => b.score - a.score);
}

/**
 * Categorize scholarships into meaningful groups
 */
export function categorizeScholarships(scholarships: ScoredScholarship[]): any[] {
  // Create categories
  const categories: any[] = [
    { name: 'Best Matches', count: 0, scholarships: [] },
    { name: 'Local Scholarships', count: 0, scholarships: [] },
    { name: 'Major-Specific', count: 0, scholarships: [] },
    { name: 'Easiest to Apply', count: 0, scholarships: [] },
    { name: 'Highest Amount', count: 0, scholarships: [] },
    { name: 'Deadline Soon', count: 0, scholarships: [] }
  ];

  // Assign scholarships to categories
  scholarships.forEach(scholarship => {
    // Best Matches: top by score
    if (scholarship.score >= 75) {
      categories[0].scholarships.push(scholarship);
    }

    // Local Scholarships
    if (scholarship.is_local || scholarship.state) {
      categories[1].scholarships.push(scholarship);
    }

    // Major-Specific
    if (scholarship.major) {
      categories[2].scholarships.push(scholarship);
    }

    // Easiest to Apply: low competition
    if (scholarship.competition_level === 'Low') {
      categories[3].scholarships.push(scholarship);
    }

    // Highest Amount: sort by amount
    if (scholarship.amount >= 5000) {
      categories[4].scholarships.push(scholarship);
    }
    
    // Deadline Soon: next 30 days
    if (scholarship.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(scholarship.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDeadline <= 30) {
        categories[5].scholarships.push(scholarship);
      }
    }
  });

  // Sort and limit each category
  categories[0].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => b.score - a.score);
  categories[1].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => b.score - a.score);
  categories[2].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => b.score - a.score);
  categories[3].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => b.competition_level.localeCompare(a.competition_level));
  categories[4].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => b.amount - a.amount);
  categories[5].scholarships.sort((a: ScoredScholarship, b: ScoredScholarship) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  // Limit each category to 10 items and update counts
  categories.forEach(category => {
    category.scholarships = category.scholarships.slice(0, 10);
    category.count = category.scholarships.length;
  });

  // Filter out empty categories
  return categories.filter(category => category.count > 0);
}