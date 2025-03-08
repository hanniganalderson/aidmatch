import { useState, useCallback } from 'react';
import { searchSchools } from '../lib/api';
import type { SchoolData } from '../types';

export function useSchoolSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolData[]>([]);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSchools([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchSchools(query);
      setSchools(results);
    } catch (err) {
      console.error('Error searching schools:', err);
      setError('Failed to search schools. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    loading,
    error,
    search
  };
}