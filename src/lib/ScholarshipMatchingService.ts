// src/lib/ScholarshipMatchingService.ts
import { supabase } from './supabase';
import { calculateScholarshipScore, diversifyResults, categorizeScholarships } from './scoring';
import type { Scholarship, UserProfile, ScoredScholarship, MatchResult } from '../types';

// Implements a cache for scholarship matching results
class MatchResultCache {
  private cache = new Map<string, { data: MatchResult; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Generate a cache key from user profile
  private createCacheKey(userProfile: UserProfile): string {
    return `${userProfile.education_level}|${userProfile.major}|${userProfile.gpa}|${userProfile.location}|${userProfile.is_pell_eligible}`;
  }

  // Get cached result if available
  get(userProfile: UserProfile): MatchResult | null {
    const key = this.createCacheKey(userProfile);
    const cachedItem = this.cache.get(key);
    
    if (!cachedItem) return null;
    
    // Check if cache is still valid
    if (Date.now() - cachedItem.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cachedItem.data;
  }

  // Store result in cache
  set(userProfile: UserProfile, result: MatchResult): void {
    const key = this.createCacheKey(userProfile);
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });
  }

  // Clear the entire cache
  clear(): void {
    this.cache.clear();
  }
}

// Create cache instance
const matchCache = new MatchResultCache();

/**
 * Get initial scholarship matches from the database
 */
async function getInitialScholarshipMatches(userProfile: UserProfile): Promise<Scholarship[]> {
  try {
    console.log('Fetching initial scholarship matches from database...');
    
    // First try to use the optimized database function
    const { data: fnData, error: fnError } = await supabase.rpc(
      'match_scholarships',
      {
        user_education: userProfile.education_level,
        user_gpa: userProfile.gpa,
        user_location: userProfile.location,
        user_major: userProfile.major,
        limit_count: 200 // Get a larger initial pool
      }
    );

    if (!fnError && fnData) {
      console.log(`Found ${fnData.length} initial matches using RPC function`);
      return fnData;
    }

    console.log('RPC function failed or not available, falling back to query');
    
    // Fallback to direct query if function fails
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .or(`gpa_requirement.is.null,gpa_requirement.lte.${userProfile.gpa}`)
      .or(`education_level.cs.{${userProfile.education_level}},education_level.is.null`)
      .or(`state.eq.${userProfile.location},national.eq.true,state.is.null`)
      .limit(200);

    if (error) throw error;
    
    console.log(`Found ${data?.length || 0} initial matches using direct query`);
    return data || [];
  } catch (error) {
    console.error('Error in database filtering:', error);
    
    // Last resort fallback - get all scholarships
    const { data: allData } = await supabase
      .from('scholarships')
      .select('*')
      .limit(200);
    
    console.log(`Fallback: returning ${allData?.length || 0} scholarships without filtering`);
    return allData || [];
  }
}

/**
 * Get matched scholarships for a user profile
 */
export async function getMatchedScholarships(userProfile: UserProfile): Promise<MatchResult> {
  // Check cache first
  const cachedResult = matchCache.get(userProfile);
  if (cachedResult) {
    console.log('Using cached scholarship match result');
    return cachedResult;
  }
  
  try {
    // Stage 1: Get initial matches from database
    const initialMatches = await getInitialScholarshipMatches(userProfile);
    
    if (initialMatches.length === 0) {
      console.log('No matches found in database');
      return { scholarships: [], categories: [], totalMatches: 0 };
    }
    
    // Stage 2: Score each scholarship
    console.log('Scoring scholarships...');
    const scoredMatches: ScoredScholarship[] = initialMatches
      .map(scholarship => ({
        ...scholarship,
        score: calculateScholarshipScore(scholarship, userProfile)
      }))
      .filter(scholarship => scholarship.score > 0) // Remove any with score of 0
      .sort((a, b) => b.score - a.score);
    
    console.log(`Found ${scoredMatches.length} scored matches`);
    
    // Stage 3: Apply business rules for diversity
    const diversifiedMatches = diversifyResults(scoredMatches);
    
    // Stage 4: Categorize scholarships
    const categories = categorizeScholarships(diversifiedMatches);
    
    // Create final result
    const result: MatchResult = {
      scholarships: diversifiedMatches,
      categories,
      totalMatches: diversifiedMatches.length
    };
    
    // Cache the result
    matchCache.set(userProfile, result);
    
    return result;
  } catch (error) {
    console.error('Error getting matched scholarships:', error);
    return { scholarships: [], categories: [], totalMatches: 0 };
  }
}

/**
 * Update scholarship popularity (used when viewed or saved)
 */
export async function incrementScholarshipPopularity(scholarshipId: string): Promise<void> {
  try {
    await supabase.rpc('increment_scholarship_popularity', { scholarship_id: scholarshipId });
  } catch (error) {
    console.error('Error updating scholarship popularity:', error);
  }
}

/**
 * Get explanation for why a scholarship is a good match
 */
export async function getScholarshipMatchExplanation(
  scholarship: ScoredScholarship, 
  userProfile: UserProfile
): Promise<string> {
  // Import dynamically to avoid circular dependencies
  const { getScholarshipExplanation } = await import('./openai');
  
  try {
    console.log('Requesting explanation for scholarship:', scholarship.id);
    const explanation = await getScholarshipExplanation(scholarship, userProfile);
    
    if (!explanation) {
      throw new Error('No explanation generated');
    }
    
    return explanation;
  } catch (error) {
    console.error('Error getting scholarship explanation:', error);
    return `This ${scholarship.name} scholarship is a great match for your ${userProfile.education_level} level and ${userProfile.major} major. Your GPA of ${userProfile.gpa} meets their requirements, making you a competitive candidate.`;
  }
}