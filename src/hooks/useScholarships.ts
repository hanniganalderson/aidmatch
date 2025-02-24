import { useState, useEffect } from 'react';
import { getMatchedScholarships } from '../lib/scholarshipService';
import type { Scholarship, UserAnswers } from '../types';

interface UseScholarshipsProps {
  answers: UserAnswers;
}

interface UseScholarshipsReturn {
  scholarships: Scholarship[];
  loading: boolean;
  error: string | null;
}

export function useScholarships({ answers }: UseScholarshipsProps): UseScholarshipsReturn {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScholarships = async () => {
      try {
        setLoading(true);
        setError(null);

        const userProfile = {
          education_level: answers.education_level,
          school: answers.school,
          major: answers.major,
          gpa: parseFloat(answers.gpa),
          location: answers.location,
          is_pell_eligible: answers.is_pell_eligible === 'Yes'
        };

        const matches = await getMatchedScholarships(userProfile);
        setScholarships(matches);
      } catch (error) {
        console.error('Error loading scholarships:', error);
        setError('Failed to load scholarships. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadScholarships();
  }, [answers]);

  return {
    scholarships,
    loading,
    error
  };
}
