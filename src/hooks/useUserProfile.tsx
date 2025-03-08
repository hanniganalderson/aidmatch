// src/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { UserAnswers } from '../types';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: UserAnswers) => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) throw result.error;
      
      setProfile({ ...profileData });
      return { success: true };
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Failed to update profile');
      return { error: 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, fetchUserProfile, updateUserProfile };
}