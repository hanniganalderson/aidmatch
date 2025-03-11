// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Prop to determine if authentication is required
  skipQuestionnaireCheck?: boolean; // New prop to skip questionnaire check for certain routes
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  skipQuestionnaireCheck = false
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Check if the user has completed the questionnaire and subscription status
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // Check profile status
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking user profile:', profileError);
        }

        // Check subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error checking subscription:', subscriptionError);
        }

        // If profile exists and has some questionnaire data, consider it completed
        const hasCompletedQuestionnaire = !!(profileData && 
          (profileData.education_level || profileData.major || profileData.gpa || profileData.location));
        
        setHasCompletedQuestionnaire(hasCompletedQuestionnaire);
        setHasSubscription(!!subscriptionData);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user && !loading) {
      checkUserStatus();
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

  // Special cases where we should skip the questionnaire check
  const isSuccessPage = location.pathname === '/success';
  const isCancelPage = location.pathname === '/cancel';
  const isBillingPage = location.pathname === '/account/billing';
  
  // If it's a special page or we've explicitly set skipQuestionnaireCheck, don't check questionnaire
  const shouldSkipQuestionnaireCheck = skipQuestionnaireCheck || isSuccessPage || isCancelPage || isBillingPage;

  // Check if they need to be redirected to the questionnaire
  // Skip this check if user is already on the questionnaire page, if auth is not required,
  // or if the current route is in our skip list
  if (user && 
      !hasCompletedQuestionnaire && 
      !location.pathname.includes('/questionnaire') && 
      requireAuth && 
      !shouldSkipQuestionnaireCheck) {
    return <Navigate to="/questionnaire" replace />;
  }

  return <>{children}</>;
}