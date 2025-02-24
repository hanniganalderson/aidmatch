import { supabase } from './supabase';
import type { Scholarship } from '../types';

import type { UserProfile } from '../types';

// Calculate ROI score for a scholarship
function calculateROI(scholarship: Scholarship, userProfile: UserProfile): number {
  let score = 0;
  
  // Base score from amount
  score += scholarship.amount || 0;

  // Bonus for exact education level match
  if (scholarship.education_level === userProfile.education_level) {
    score *= 1.5;
  }

  // Bonus for meeting GPA requirement
  if (userProfile.gpa >= (scholarship.min_gpa || 0)) {
    score *= 1.2;
  }

  return score;
}

// Get best matching scholarships with fallback
export async function getMatchedScholarships(userProfile: UserProfile): Promise<Scholarship[]> {
  try {
    // Get all available scholarships
    const { data: allScholarships, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('amount', { ascending: false })
      .limit(10);

    if (error) throw error;
    if (!allScholarships?.length) return [];

    // Find exact matches first
    const exactMatches = allScholarships.filter(s => 
      s.education_level === userProfile.education_level &&
      userProfile.gpa >= (s.min_gpa || 0)
    );

    // If we have enough exact matches, return them
    if (exactMatches.length >= 3) {
      return exactMatches
        .sort((a, b) => calculateROI(b, userProfile) - calculateROI(a, userProfile))
        .slice(0, 6);
    }

    // Otherwise, combine exact matches with best alternative matches
    const alternativeMatches = allScholarships
      .filter(s => !exactMatches.includes(s))
      .sort((a, b) => calculateROI(b, userProfile) - calculateROI(a, userProfile))
      .slice(0, 6 - exactMatches.length);

    return [...exactMatches, ...alternativeMatches];
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    return [];
  }
}