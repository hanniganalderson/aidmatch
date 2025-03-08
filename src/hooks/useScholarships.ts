import { useState, useCallback } from 'react';
import { getMatchedScholarships, saveScholarship, unsaveScholarship } from '../lib/api';
import type { UserAnswers, ScoredScholarship } from '../types';

export function useScholarships() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scholarships, setScholarships] = useState<ScoredScholarship[]>([]);

  const fetchScholarships = useCallback(async (answers: UserAnswers) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await getMatchedScholarships(answers);
      setScholarships(results);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError('Failed to load scholarships. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSave = useCallback(async (userId: string, scholarshipId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        await unsaveScholarship(userId, scholarshipId);
      } else {
        await saveScholarship(userId, scholarshipId);
      }
      return true;
    } catch (err) {
      console.error('Error toggling scholarship save:', err);
      return false;
    }
  }, []);

  return {
    scholarships,
    loading,
    error,
    fetchScholarships,
    toggleSave
  };
}