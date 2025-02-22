import { useState, useCallback } from 'react';
import { getMatchedScholarships } from '../lib/scholarshipService';
import type { Scholarship, UserAnswers } from '../types';

interface UseScholarshipsProps {
  answers: UserAnswers;
  isAlternativeResults?: boolean;
}

interface UseScholarshipsReturn {
  scholarships: Array<Scholarship & { score: number }>;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
}

const ITEMS_PER_PAGE = 10;

export function useScholarships({ answers, isAlternativeResults = false }: UseScholarshipsProps): UseScholarshipsReturn {
  const [scholarships, setScholarships] = useState<Array<Scholarship & { score: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const userProfile = {
        education_level: answers.education_level,
        school: answers.school,
        major: answers.major,
        gpa: parseFloat(answers.gpa),
        location: answers.location,
        is_pell_eligible: answers.is_pell_eligible === 'Yes'
      };

      // Fetch matched scholarships with retries
      let retries = 3;
      let matchedScholarships: Array<Scholarship & { score: number }> = [];
      
      while (retries > 0) {
        try {
          const response = await getMatchedScholarships(userProfile, {
            limit: ITEMS_PER_PAGE,
            offset: (page - 1) * ITEMS_PER_PAGE,
            includeExpired: isAlternativeResults
          });
          matchedScholarships = response;
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update state with new scholarships
      setScholarships(prev => {
        if (page === 1) return matchedScholarships;
        
        // Deduplicate scholarships when appending
        const existingIds = new Set(prev.map(s => s.id));
        const newScholarships = matchedScholarships.filter(s => !existingIds.has(s.id));
        return [...prev, ...newScholarships];
      });

      // Update hasMore based on the number of scholarships received
      setHasMore(matchedScholarships.length === ITEMS_PER_PAGE);
      setPage(p => p + 1);
    } catch (err) {
      console.error('Error loading scholarships:', err);
      setError('Failed to load scholarships. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [answers, page, isAlternativeResults]);

  return {
    scholarships,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    setError,
    setPage
  };
}
