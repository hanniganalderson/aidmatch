// src/hooks/useScholarshipMatching.ts
import { useState, useEffect, useCallback } from 'react';
import { getMatchedScholarships, getScholarshipMatchExplanation } from '../lib/ScholarshipMatchingService';
import { supabase } from '../lib/supabase';
import type { ScoredScholarship, UserAnswers, UserProfile, MatchResult, ScholarshipFilters } from '../types';

// Helper function to convert user answers to profile
function getUserProfile(answers: UserAnswers): UserProfile {
  return {
    education_level: answers.education_level,
    school: answers.school,
    major: answers.major,
    gpa: parseFloat(answers.gpa),
    location: answers.location,
    is_pell_eligible: answers.is_pell_eligible === 'Yes'
  };
}

/**
 * Hook for scholarship matching functionality
 */
export function useScholarshipMatching(answers: UserAnswers) {
  const [matchResult, setMatchResult] = useState<MatchResult>({
    scholarships: [],
    categories: [],
    totalMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});

  // Load scholarships based on user answers
  useEffect(() => {
    async function loadScholarships() {
      try {
        setLoading(true);
        setError(null);

        const userProfile = getUserProfile(answers);
        
        // Get matches from service
        const result = await getMatchedScholarships(userProfile);
        setMatchResult(result);
      } catch (err) {
        console.error('Error loading scholarships:', err);
        setError('Failed to load scholarships. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (answers.education_level && answers.major && answers.gpa) {
      loadScholarships();
    } else {
      setLoading(false);
      setError('Please complete all required fields to find matching scholarships.');
    }
  }, [answers]);

  // Function to get explanation for a specific scholarship
  const getExplanation = useCallback(async (scholarship: ScoredScholarship) => {
    // If explanation already exists, just return it
    if (scholarship.explanation) {
      console.log('Using existing explanation');
      return scholarship.explanation;
    }
    
    try {
      console.log('Setting explanation loading state for:', scholarship.id);
      setExplanationLoading(prev => ({ ...prev, [scholarship.id]: true }));
      
      const userProfile = getUserProfile(answers);
      console.log('Requesting explanation for scholarship:', scholarship.id, 'with profile:', userProfile);
      
      const explanation = await getScholarshipMatchExplanation(scholarship, userProfile);
      console.log('Received explanation, length:', explanation.length);
      
      if (!explanation || explanation.length < 10) {
        throw new Error('Invalid explanation received');
      }
      
      // Update scholarship with explanation in state
      setMatchResult(prev => {
        console.log('Updating matchResult with new explanation');
        
        // Update in main scholarships array
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
      
      return explanation;
    } catch (err) {
      console.error('Error getting explanation:', err);
      
      // Create fallback explanation
      const fallbackExplanation = `This ${scholarship.name} scholarship is a strong match for your profile. With your GPA of ${answers.gpa} in ${answers.major}, you're well-positioned to apply for this ${scholarship.amount.toLocaleString()} scholarship.`;
      
      // Update state with fallback explanation
      setMatchResult(prev => {
        const updatedScholarships = prev.scholarships.map(s => 
          s.id === scholarship.id ? { ...s, explanation: fallbackExplanation } : s
        );
        
        const updatedCategories = prev.categories.map(category => ({
          ...category,
          scholarships: category.scholarships.map(s => 
            s.id === scholarship.id ? { ...s, explanation: fallbackExplanation } : s
          )
        }));
        
        return {
          ...prev,
          scholarships: updatedScholarships,
          categories: updatedCategories
        };
      });
      
      return fallbackExplanation;
    } finally {
      console.log('Clearing explanation loading state for:', scholarship.id);
      setExplanationLoading(prev => ({ ...prev, [scholarship.id]: false }));
    }
  }, [answers]);

  // Function to apply filters to scholarships
  const filterScholarships = useCallback((
    scholarships: ScoredScholarship[], 
    filters: ScholarshipFilters,
    searchTerm?: string
  ): ScoredScholarship[] => {
    return scholarships.filter(scholarship => {
      // Apply search filter if term exists
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const nameMatch = scholarship.name.toLowerCase().includes(term);
        const providerMatch = scholarship.provider.toLowerCase().includes(term);
        const majorMatch = scholarship.major?.toLowerCase().includes(term);
        const requirementsMatch = scholarship.requirements?.toLowerCase().includes(term);
        
        if (!(nameMatch || providerMatch || majorMatch || requirementsMatch)) {
          return false;
        }
      }
      
      // Apply amount filter
      if (scholarship.amount < filters.minAmount || scholarship.amount > filters.maxAmount) {
        return false;
      }
      
      // Apply competition level filter
      if (filters.competition.length > 0 && 
          !filters.competition.includes(scholarship.competition_level)) {
        return false;
      }
      
      // Apply geographic scope filter
      if (filters.scope && filters.scope.length > 0) {
        const isLocal = scholarship.is_local || (scholarship.state && !scholarship.national);
        const isNational = scholarship.national && !scholarship.is_local;
        
        const matchesScope = (
          (filters.scope.includes('Local') && isLocal) ||
          (filters.scope.includes('National') && isNational) ||
          (filters.scope.includes('State') && scholarship.state) ||
          (filters.scope.includes('International') && scholarship.national)
        );
        
        if (!matchesScope) {
          return false;
        }
      }
      
      // Apply deadline filter
      if (filters.deadline) {
        if (!scholarship.deadline) return false;
        
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const daysFilter = parseInt(filters.deadline);
        if (daysUntil > daysFilter) {
          return false;
        }
      }
      
      // Apply education level filter
      if (filters.educationLevel && filters.educationLevel.length > 0) {
        if (!scholarship.education_level) return false;
        
        const hasMatchingLevel = scholarship.education_level.some(level => 
          filters.educationLevel.includes(level)
        );
        
        if (!hasMatchingLevel) {
          return false;
        }
      }
      
      // Apply major filter
      if (filters.major && scholarship.major !== filters.major) {
        return false;
      }
      
      // Apply need-based filter
      if (filters.needBased !== null && scholarship.is_need_based !== undefined) {
        if (scholarship.is_need_based !== filters.needBased) {
          return false;
        }
      }
      
      // Apply essay requirement filter
      if (filters.essayRequired !== null && scholarship.essay_required !== undefined) {
        if (scholarship.essay_required !== filters.essayRequired) {
          return false;
        }
      }
      
      return true;
    });
  }, []);

  // Function to sort scholarships
  const sortScholarships = useCallback((
    scholarships: ScoredScholarship[], 
    sortBy: string
  ): ScoredScholarship[] => {
    const sorted = [...scholarships];
    
    switch (sortBy) {
      case 'deadline':
        return sorted.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      case 'amount':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'competition':
        return sorted.sort((a, b) => {
          const competitionOrder = { 'Low': 0, 'Medium': 1, 'High': 2 };
          return competitionOrder[a.competition_level] - competitionOrder[b.competition_level];
        });
      case 'match':
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  }, []);

  return {
    matchResult,
    loading,
    error,
    getExplanation,
    explanationLoading,
    filterScholarships,
    sortScholarships
  };
}

/**
 * Hook to manage saved scholarships
 */
export function useSavedScholarships(userId?: string) {
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});

  // Load saved scholarships
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSavedScholarships = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get saved scholarship IDs and data
        const { data, error } = await supabase
          .from('saved_scholarships')
          .select(`
            scholarship_id,
            scholarships (*)
          `)
          .eq('user_id', userId);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Extract scholarship data and add scores
          const scholarships = data.map(item => ({
            ...(item.scholarships as Scholarship),
            score: 100 // Default score for saved items
          }));
          
          setSavedScholarships(scholarships);
          setSavedIds(data.map(item => item.scholarship_id));
        } else {
          setSavedScholarships([]);
          setSavedIds([]);
        }
      } catch (err) {
        console.error('Error loading saved scholarships:', err);
        setError('Failed to load saved scholarships');
      } finally {
        setLoading(false);
      }
    };

    loadSavedScholarships();
  }, [userId]);

  // Toggle saving a scholarship
  const toggleSave = useCallback(async (scholarship: ScoredScholarship) => {
    setSavingState(prev => ({ ...prev, [scholarship.id]: true }));
    
    try {
      const isSaved = savedIds.includes(scholarship.id);
      
      if (!userId) {
        // Client-side only for non-logged in users
        if (isSaved) {
          setSavedIds(prev => prev.filter(id => id !== scholarship.id));
          setSavedScholarships(prev => prev.filter(s => s.id !== scholarship.id));
        } else {
          setSavedIds(prev => [...prev, scholarship.id]);
          setSavedScholarships(prev => [...prev, { ...scholarship, score: 100 }]);
        }
        return true;
      }
      
      if (isSaved) {
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
      }
      
      return true;
    } catch (err) {
      console.error('Error toggling scholarship save:', err);
      return false;
    } finally {
      setSavingState(prev => ({ ...prev, [scholarship.id]: false }));
    }
  }, [userId, savedIds]);

  // Check if a scholarship is saved
  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return {
    savedScholarships,
    savedIds,
    loading,
    error,
    toggleSave,
    isSaved,
    isSaving: savingState
  };
}