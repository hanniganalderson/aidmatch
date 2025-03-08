import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Scholarship } from '../types';

interface UseScholarshipSaveProps {
  userId?: string;
  onError?: (error: string) => void;
}

interface UseScholarshipSaveReturn {
  savedScholarshipIds: string[];
  saving: boolean;
  loadSavedScholarships: () => Promise<void>;
  toggleSave: (scholarship: Scholarship) => Promise<boolean>;
}

export function useScholarshipSave({ userId, onError }: UseScholarshipSaveProps): UseScholarshipSaveReturn {
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loadSavedScholarships = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) {
        setSavedScholarshipIds(data.map(item => item.scholarship_id));
      }
    } catch (err) {
      console.error('Error loading saved scholarships:', err);
      onError?.('Failed to load saved scholarships');
    }
  }, [userId, onError]);

  const toggleSave = useCallback(async (scholarship: Scholarship) => {
    if (!userId) return false;

    setSaving(true);
    try {
      if (savedScholarshipIds.includes(scholarship.id)) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', userId)
          .eq('scholarship_id', scholarship.id);

        if (error) throw error;
        setSavedScholarshipIds(prev => prev.filter(id => id !== scholarship.id));
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_scholarships')
          .upsert({
            user_id: userId,
            scholarship_id: scholarship.id
          });

        if (error) throw error;
        setSavedScholarshipIds(prev => [...prev, scholarship.id]);
      }
      return true;
    } catch (err) {
      console.error('Error toggling scholarship save:', err);
      onError?.('Failed to save scholarship');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, savedScholarshipIds, onError]);

  return {
    savedScholarshipIds,
    saving,
    loadSavedScholarships,
    toggleSave
  };
}
