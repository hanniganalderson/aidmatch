// src/hooks/useScholarshipMatching.ts
import { useState, useEffect, useCallback } from 'react';
import { getMatchedScholarships, incrementScholarshipPopularity } from '../lib/ScholarshipMatchingService';
import { getScholarshipExplanation } from '../lib/openai';
import type { ScoredScholarship, UserAnswers, UserProfile, MatchCategory, MatchResult } from '../types';
import { supabase } from '../lib/supabase';

// Cache implementation for scholarship results
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ScholarshipCache {
  private cache = new Map<string, { data: MatchResult; timestamp: number }>();

  set(key: string, data: MatchResult): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): MatchResult | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const scholarshipCache = new ScholarshipCache();

// Helper function to create a cache key from user profile
function createCacheKey(userProfile: UserProfile): string {
  return `${userProfile.education_level}|${userProfile.major}|${userProfile.gpa}|${userProfile.location}|${userProfile.is_pell_eligible}`;
}

// Hook to get matched scholarships
export function useScholarshipMatching(answers: UserAnswers) {
  const [matchResult, setMatchResult] = useState<MatchResult>({
    scholarships: [],
    categories: [],
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert user answers to profile
  const getUserProfile = useCallback((answers: UserAnswers): UserProfile => {
    return {
      education_level: answers.education_level,
      school: answers.school,
      major: answers.major,
      gpa: parseFloat(answers.gpa),
      location: answers.location,
      is_pell_eligible: answers.is_pell_eligible === 'Yes'
    };
  }, []);

  // Group scholarships into categories
  const categorizeScholarships = useCallback((scholarships: ScoredScholarship[]): MatchCategory[] => {
    // Create primary categories
    const categories: MatchCategory[] = [
      { name: 'Best Matches', count: 0, scholarships: [] },
      { name: 'Local Scholarships', count: 0, scholarships: [] },
      { name: 'Major-Specific', count: 0, scholarships: [] },
      { name: 'Easiest to Apply', count: 0, scholarships: [] },
      { name: 'Highest Amount', count: 0, scholarships: [] }
    ];

    // Assign scholarships to categories
    scholarships.forEach(scholarship => {
      // Best Matches: top 5 by score
      if (scholarship.score >= 80) {
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
      categories[4].scholarships.push(scholarship);
    });

    // Sort each category appropriately
    categories[0].scholarships.sort((a, b) => b.score - a.score);
    categories[1].scholarships.sort((a, b) => b.score - a.score);
    categories[2].scholarships.sort((a, b) => b.score - a.score);
    categories[3].scholarships.sort((a, b) => (b.deadline ? new Date(b.deadline).getTime() : 0) - 
                                            (a.deadline ? new Date(a.deadline).getTime() : 0));
    categories[4].scholarships.sort((a, b) => b.amount - a.amount);

    // Limit each category to 10 items and update counts
    categories.forEach(category => {
      category.scholarships = category.scholarships.slice(0, 10);
      category.count = category.scholarships.length;
    });

    // Filter out empty categories
    return categories.filter(category => category.count > 0);
  }, []);

  // Load scholarships
  useEffect(() => {
    const loadScholarships = async () => {
      try {
        setLoading(true);
        setError(null);

        const userProfile = getUserProfile(answers);
        const cacheKey = createCacheKey(userProfile);
        
        // Check cache first
        const cachedResult = scholarshipCache.get(cacheKey);
        if (cachedResult) {
          setMatchResult(cachedResult);
          setLoading(false);
          return;
        }

        // Get matches from service
        const scoredScholarships = await getMatchedScholarships(userProfile);
        
        // Create categories
        const categories = categorizeScholarships(scoredScholarships);
        
        // Create final result
        const result: MatchResult = {
          scholarships: scoredScholarships,
          categories,
          totalMatches: scoredScholarships.length
        };
        
        // Cache the result
        scholarshipCache.set(cacheKey, result);
        
        setMatchResult(result);
      } catch (err) {
        console.error('Error loading scholarships:', err);
        setError('Failed to load scholarships. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadScholarships();
  }, [answers, getUserProfile, categorizeScholarships]);

  // Function to get explanation for a specific scholarship
  const getExplanation = useCallback(async (scholarship: ScoredScholarship) => {
    if (scholarship.explanation) return scholarship.explanation;
    
    try {
      const userProfile = getUserProfile(answers);
      const explanation = await getScholarshipExplanation(scholarship, userProfile);
      
      // Update scholarship with explanation
      setMatchResult(prev => {
        const updatedScholarships = prev.scholarships.map(s => 
          s.id === scholarship.id ? { ...s, explanation } : s
        );
        
        // Also update in categories
        const updatedCategories = prev.categories.map(category => ({
          ...category,
          scholarships: category.scholarships.map(s => 
            s.id === scholarship.id ? { ...s, explanation } : s
          )
        }));
        
        return {
          ...prev,
          scholarships: updatedScholarships,
          categories: updatedCategories
        };
      });
      
      // Update popularity
      incrementScholarshipPopularity(scholarship.id);
      
      return explanation;
    } catch (err) {
      console.error('Error getting explanation:', err);
      return 'Unable to generate explanation at this time.';
    }
  }, [answers, getUserProfile]);

  return {
    matchResult,
    loading,
    error,
    getExplanation
  };
}

// Hook to save scholarships and track them
export function useSavedScholarships(userId?: string) {
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved scholarships for user
  useEffect(() => {
    const loadSavedScholarships = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('saved_scholarships')
          .select(`
            scholarship_id,
            scholarships (*)
          `)
          .eq('user_id', userId);

        if (error) throw error;
        
        if (data) {
          const scholarshipsData = data.map((item: { scholarships: ScoredScholarship }) => ({
            ...item.scholarships,
            score: 100 // Default perfect score for saved items
          }));
          
          setSavedScholarships(scholarshipsData as ScoredScholarship[]);
          setSavedIds(data.map((item: { scholarship_id: string }) => item.scholarship_id));
        }
      } catch (err) {
        console.error('Error loading saved scholarships:', err);
        setError('Failed to load your saved scholarships.');
      } finally {
        setLoading(false);
      }
    };

    loadSavedScholarships();
  }, [userId]);

  // Toggle saving a scholarship
  const toggleSave = useCallback(async (scholarship: ScoredScholarship) => {
    // If no user ID, we still want to update the UI state for the current session
    // This allows the save button to work even when not logged in
    if (!userId) {
      if (savedIds.includes(scholarship.id)) {
        // Remove from saved (client-side only)
        setSavedIds(prev => prev.filter(id => id !== scholarship.id));
        setSavedScholarships(prev => prev.filter(s => s.id !== scholarship.id));
      } else {
        // Add to saved (client-side only)
        setSavedIds(prev => [...prev, scholarship.id]);
        setSavedScholarships(prev => [...prev, { ...scholarship, score: 100 }]);
        
        // Update popularity
        incrementScholarshipPopularity(scholarship.id);
      }
      return true;
    }

    try {
      if (savedIds.includes(scholarship.id)) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', userId)
          .eq('scholarship_id', scholarship.id);

        if (error) throw error;
        
        setSavedIds(prev => prev.filter(id => id !== scholarship.id));
        setSavedScholarships(prev => prev.filter(s => s.id !== scholarship.id));
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_scholarships')
          .upsert({
            user_id: userId,
            scholarship_id: scholarship.id,
            saved_at: new Date().toISOString()
          });

        if (error) throw error;
        
        setSavedIds(prev => [...prev, scholarship.id]);
        setSavedScholarships(prev => [...prev, { ...scholarship, score: 100 }]);
        
        // Update popularity
        incrementScholarshipPopularity(scholarship.id);
      }
      return true;
    } catch (err) {
      console.error('Error toggling scholarship save:', err);
      setError('Failed to update saved scholarships.');
      return false;
    }
  }, [userId, savedIds]);

  return {
    savedScholarships,
    savedIds,
    loading,
    error,
    toggleSave,
    isSaved: useCallback((id: string) => savedIds.includes(id), [savedIds])
  };
}