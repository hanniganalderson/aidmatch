// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // New prop to determine if authentication is required
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  // Check if the user has completed the questionnaire
  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user profile:', error);
        }

        // If profile exists and has some questionnaire data, consider it completed
        const hasCompletedQuestionnaire = !!(data && 
          (data.education_level || data.major || data.gpa || data.location));
        
        setHasCompletedQuestionnaire(hasCompletedQuestionnaire);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !loading) {
      checkQuestionnaireStatus();
    } else {
      setProfileLoading(false);
    }
  }, [user, loading]);

  // Show loading state while checking auth and profile
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  // If authentication is required but user is not logged in, redirect to sign in
  if (requireAuth && !user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  // Redirect to questionnaire if authenticated but hasn't completed it
  // Skip this check if user is already on the questionnaire page or if auth is not required
  if (user && !hasCompletedQuestionnaire && 
      !location.pathname.includes('/questionnaire') && 
      requireAuth) {
    return <Navigate to="/questionnaire" replace />;
  }

  return <>{children}</>;
}