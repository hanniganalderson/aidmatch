// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FeatureName } from '../lib/feature-management';
import { PaywallModal } from './ui/PaywallModal';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean; // Prop to determine if authentication is required
  skipQuestionnaireCheck?: boolean; // New prop to skip questionnaire check for certain routes
  requiredSubscription?: boolean; // Add this prop to check for subscription
  requiredFeature?: FeatureName;
  requireQuestionnaire?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  skipQuestionnaireCheck = false,
  requiredSubscription = false,
  requiredFeature,
  requireQuestionnaire = false
}: ProtectedRouteProps) {
  const { user, loading, isSubscribed } = useAuth();
  const location = useLocation();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true);

  // Check if the user has completed the questionnaire
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

        // If profile exists and has some questionnaire data, consider it completed
        const hasCompletedQuestionnaire = !!(profileData && 
          (profileData.education_level || profileData.major || profileData.gpa || profileData.location));
        
        setHasCompletedQuestionnaire(hasCompletedQuestionnaire);
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

  useEffect(() => {
    // Check if user has completed questionnaire
    const checkQuestionnaire = async () => {
      if (user) {
        try {
          // This is just a placeholder - replace with your actual check
          // For now, we'll assume they have completed it to prevent redirection
          setHasCompletedQuestionnaire(true);
        } catch (error) {
          console.error('Error checking questionnaire status:', error);
          setHasCompletedQuestionnaire(false);
        } finally {
          setCheckingQuestionnaire(false);
        }
      } else {
        setCheckingQuestionnaire(false);
      }
    };
    
    checkQuestionnaire();
  }, [user]);

  // Show loading state while checking auth and profile
  if (loading || profileLoading || checkingQuestionnaire) {
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
  const isPlusPage = location.pathname === '/plus';
  
  // If it's a special page or we've explicitly set skipQuestionnaireCheck, don't check questionnaire
  const shouldSkipQuestionnaireCheck = skipQuestionnaireCheck || 
    isSuccessPage || isCancelPage || isBillingPage || isPlusPage;

  // Check if they need to be redirected to the questionnaire
  if (user && 
      !hasCompletedQuestionnaire && 
      !location.pathname.includes('/questionnaire') && 
      requireAuth && 
      !shouldSkipQuestionnaireCheck) {
    return <Navigate to="/questionnaire" replace />;
  }

  // Check if subscription is required and user is not subscribed
  if (requiredSubscription && !isSubscribed) {
    // Instead of redirecting, show the paywall modal
    if (!showPaywall) {
      setShowPaywall(true);
    }
    
    return (
      <>
        {children}
        <PaywallModal 
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName={requiredFeature || FeatureName.SAVED_SCHOLARSHIPS}
          title="This Feature Requires Plus"
          description="Upgrade to AidMatch Plus to access this premium feature."
        />
      </>
    );
  }

  // If we have a required feature but no subscription requirement,
  // the useFeatureAccess hook will handle showing the paywall when needed
  return <>{children}</>;
}