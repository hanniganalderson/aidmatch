import { supabase } from './supabase';
import { calculateScholarshipScore } from './scoring';
import type { Scholarship } from './types';

const scholarshipCache = new Map<string, { data: ScoredScholarship[]; timestamp: number }>();

// Types for scholarship scoring
interface ScoredScholarship extends Scholarship {
  score: number;
}

interface QueryOptions {
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
}

interface UserProfile {
  education_level: string;
  school: string;
  major: string;
  gpa: number;
  location: string;
  is_pell_eligible: boolean;
}

function getCacheKey(userProfile: UserProfile, options: QueryOptions): string {
  return JSON.stringify({
    ...userProfile,
    limit: options.limit,
    offset: options.offset,
    includeExpired: options.includeExpired
  });
}

export async function getMatchedScholarships(
  userProfile: UserProfile,
  options: QueryOptions = { limit: 50, offset: 0, includeExpired: false }
): Promise<Array<Scholarship & { score: number }>> {
  try {
    const cacheKey = getCacheKey(userProfile, options);
    const cached = scholarshipCache.get(cacheKey);
    if (cached) return cached as ScoredScholarship[];

    // Base query with indexed fields
    let query = supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .gte('min_gpa', userProfile.gpa)
      .or(`requires_pell.is.null,requires_pell.eq.${userProfile.is_pell_eligible}`);

    // Add location-based filters
    if (userProfile.school) {
      query = query.or(`school.is.null,school.eq.'${userProfile.school}'`);
    }
    if (userProfile.location) {
      query = query.or(`state.is.null,state.eq.'${userProfile.location}'`);
    }

    // Add education and major filters
    query = query
      .or(`education_level.is.null,education_level.eq.'${userProfile.education_level}'`)
      .or(`major.is.null,major.eq.'${userProfile.major}',major.eq.'STEM'`);

    // Add deadline filter if not including expired
    if (!options.includeExpired) {
      query = query.gte('deadline', new Date().toISOString());
    }

    // Add ordering and pagination
    query = query.order('amount', { ascending: false });
    query = query.range(options.offset, options.offset + options.limit - 1);

    try {
      const { data: matches, error } = await query;
      if (error) throw error;

      // Score and sort matches
      const scoredMatches = (matches || []).map(scholarship => ({
        ...scholarship,
        score: calculateScholarshipScore(scholarship, userProfile)
      })).sort((a, b) => b.score - a.score);

      // Cache results
      scholarshipCache.set(cacheKey, scoredMatches);

      // If we need alternative matches and no exact matches found
      if (options.includeExpired && (!matches || matches.length === 0)) {
        // Get alternative matches with relaxed criteria
        const { data: alternativeMatches, error: altError } = await supabase
          .from('scholarships')
          .select('*')
          .eq('is_active', true)
          .or(`education_level.is.null,education_level.eq.'${userProfile.education_level}'`)
          .or(`major.is.null,major.eq.'${userProfile.major}',major.eq.'STEM'`)
          .gte('min_gpa', Math.max(userProfile.gpa - 0.5, 2.0))
          .order('amount', { ascending: false })
          .range(options.offset, options.offset + options.limit - 1);

        if (altError) throw altError;

        const scoredAlternatives = (alternativeMatches || []).map(scholarship => ({
          ...scholarship,
          score: calculateScholarshipScore(scholarship, userProfile) * 0.8 // Reduce score for alternative matches
        })).sort((a, b) => b.score - a.score);

        return scoredAlternatives;
      }

      return scoredMatches;
    } catch (queryError) {
      console.error('Error executing scholarship query:', queryError);
      throw queryError;
    }
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...profile,
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
  return data;
}

export async function saveScholarship(userId: string, scholarshipId: string) {
  const { data, error } = await supabase
    .from('saved_scholarships')
    .upsert({
      user_id: userId,
      scholarship_id: scholarshipId,
      saved_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,scholarship_id'
    });

  if (error) throw error;
  return data;
}
