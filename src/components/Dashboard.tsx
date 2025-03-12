// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Bookmark, Calendar, Award, DollarSign, 
  ArrowRight, TrendingUp, Crown, Search, AlertCircle,
  CheckCircle, Lock, Bell, RefreshCw, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { PremiumFeatureGate } from './ui/premiumFeatureGate';
import { FeatureLimitIndicator } from './ui/FeatureLimitIndicator';
import { useFeatureUsage, FeatureName } from '../lib/feature-usage';
import type { UserAnswers, ScoredScholarship } from '../types';
import ErrorBoundary from './ErrorBoundary';

interface DashboardProps {
  userAnswers?: UserAnswers;
}

export function Dashboard({ userAnswers }: DashboardProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;
  
  // Use the subscription context safely
  let isSubscribed = false;
  try {
    const subscriptionContext = useSubscription();
    isSubscribed = subscriptionContext?.isSubscribed || false;
  } catch (err) {
    console.error('Error using subscription context:', err);
  }
  
  // Local states
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserAnswers | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Safe usage of feature tracking - FIX FOR LINE 130
  // Initialize with default values to avoid potential null/undefined errors
  const [savedScholarshipsUsage, setSavedScholarshipsUsage] = useState({ 
    hasReachedLimit: false, 
    loading: false 
  });
  
  useEffect(() => {
    try {
      const usage = useFeatureUsage(FeatureName.SAVED_SCHOLARSHIPS);
      if (usage) {
        setSavedScholarshipsUsage(usage);
      }
    } catch (err) {
      console.error('Error using feature usage hook:', err);
    }
  }, []);
  
  // Load user profile and saved scholarships
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Handle case when user is not available yet
        if (!user) {
          setProfile(userAnswers || null);
          setLoading(false);
          return;
        }
        
        try {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', profileError);
          }
          
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile(userAnswers || null);
          }
          
          // Fetch saved scholarships
          const { data: savedData, error: savedError } = await supabase
            .from('saved_scholarships')
            .select('scholarship_id')
            .eq('user_id', user.id);
            
          if (savedError) {
            console.error('Error fetching saved scholarships:', savedError);
            return;
          }
          
          if (savedData && savedData.length > 0) {
            const savedIds = savedData.map(item => item.scholarship_id);
            
            const { data: scholarshipsData, error: scholarshipsError } = await supabase
              .from('scholarships')
              .select('*')
              .in('id', savedIds);
              
            if (scholarshipsError) {
              console.error('Error fetching scholarship details:', scholarshipsError);
              return;
            }
            
            if (scholarshipsData) {
              const scholarships: ScoredScholarship[] = scholarshipsData.map(s => ({
                ...s,
                score: 100 // Default score for saved items
              }));
              
              setSavedScholarships(scholarships);
              
              // Extract upcoming deadlines from saved scholarships
              const today = new Date();
              const inOneMonth = new Date();
              inOneMonth.setMonth(today.getMonth() + 1);
              
              const deadlines = scholarships
                .filter(s => s.deadline && new Date(s.deadline) > today && new Date(s.deadline) < inOneMonth)
                .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
                
              setUpcomingDeadlines(deadlines);
            }
          }
        } catch (err) {
          console.error('Error in data fetching:', err);
          setError('Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, userAnswers]);
  
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days remaining for a deadline
  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // Determine if the profile is complete
  const isProfileComplete = Boolean(
    profile?.education_level &&
    profile?.school &&
    profile?.major &&
    profile?.gpa &&
    profile?.location
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {error || "We couldn't load the dashboard. Please try again later."}
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the welcome section
  const renderWelcomeSection = () => {
    const userName = auth.getUserDisplayName();
    const userEmail = user?.email || '';
    
    return (
      <motion.div
        variants={itemVariants}
        className={`p-6 ${
          isSubscribed 
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30' 
            : 'bg-white dark:bg-gray-800'
        } rounded-xl border ${
          isSubscribed 
            ? 'border-indigo-100 dark:border-indigo-800/30' 
            : 'border-gray-200 dark:border-gray-700'
        } shadow-md`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full ${
              isSubscribed 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                : 'bg-primary-100 dark:bg-primary-900/30'
            } flex items-center justify-center text-2xl text-white`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {userName}
                </h2>
                {isSubscribed && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    <Crown className="w-3 h-3" />
                    <span>Plus</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userEmail}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isSubscribed && (
              <Button
                onClick={() => navigate('/plus')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Plus
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/questionnaire')}
              variant={isSubscribed ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {isProfileComplete ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </div>
        </div>
        
        {!isProfileComplete && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-medium">Your profile is incomplete</p>
              <p className="text-amber-700 dark:text-amber-400 text-sm">
                Complete your profile to get better scholarship matches and recommendations.
              </p>
              <Button
                onClick={() => navigate('/questionnaire')}
                variant="link"
                className="text-amber-600 dark:text-amber-400 p-0 h-auto mt-1"
              >
                Complete Questionnaire
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
        
        {!isSubscribed && isProfileComplete && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
                <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-900 dark:text-white">
                  Unlock Premium Features
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upgrade to Plus for unlimited AI recommendations, essay assistance, and more.
                </p>
              </div>
              <Button
                onClick={() => navigate('/plus')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
              >
                See Plans
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Render profile stat tiles
  const renderProfileTiles = () => {
    if (!profile) return null;
    
    return (
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {profile.education_level && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">Education Level</p>
            <p className="font-medium text-gray-900 dark:text-white">{profile.education_level}</p>
          </div>
        )}
        
        {profile.major && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">Major</p>
            <p className="font-medium text-gray-900 dark:text-white">{profile.major}</p>
          </div>
        )}
        
        {profile.gpa && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
            <p className="font-medium text-gray-900 dark:text-white">{profile.gpa}</p>
          </div>
        )}
        
        {profile.location && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
            <p className="font-medium text-gray-900 dark:text-white">{profile.location}</p>
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Welcome Section */}
          <ErrorBoundary>
            {renderWelcomeSection()}
          </ErrorBoundary>
          
          {/* Profile Stats */}
          <ErrorBoundary>
            {isProfileComplete && renderProfileTiles()}
          </ErrorBoundary>
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column: Scholarships and Deadlines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Saved Scholarships Section */}
              <ErrorBoundary>
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-6 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-primary-500" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Scholarships</h2>
                    </div>
                    
                    {/* FIX FOR LINE 310: Add proper conditional check for non-subscribed users */}
                    {!isSubscribed && (
                      <FeatureLimitIndicator 
                        featureName={FeatureName.SAVED_SCHOLARSHIPS}
                        variant="inline"
                      />
                    )}
                    
                    {savedScholarships.length > 0 && (
                      <Button
                        onClick={() => navigate('/saved-scholarships')}
                        variant="outline"
                        className="text-sm"
                      >
                        View All
                      </Button>
                    )}
                  </div>
                  
                  {/* Handle saved scholarships display with proper conditionals */}
                  {!isSubscribed && savedScholarshipsUsage.hasReachedLimit ? (
                    <PremiumFeatureGate
                      feature="Unlimited Saved Scholarships"
                      description="Upgrade to Plus to save and track all your scholarship opportunities in one place."
                      icon="crown"
                    />
                  ) : savedScholarships.length > 0 ? (
                    <div className="space-y-3">
                      {savedScholarships.slice(0, 3).map(scholarship => (
                        <div 
                          key={scholarship.id}
                          className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {scholarship.name}
                          </h3>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Amount: ${scholarship.amount?.toLocaleString() || 'Varies'}
                            </p>
                            {scholarship.deadline && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(scholarship.deadline)}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => navigate(`/results`)}
                            variant="link"
                            className="mt-1 h-auto p-0 text-xs"
                          >
                            View Details
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                      
                      {savedScholarships.length > 3 && (
                        <Button
                          onClick={() => navigate('/saved-scholarships')}
                          variant="ghost"
                          className="w-full text-sm"
                        >
                          View {savedScholarships.length - 3} more
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2">No saved scholarships yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                        Save scholarships to keep track of opportunities you're interested in.
                      </p>
                      <Button
                        onClick={() => navigate('/results')}
                      >
                        Find Scholarships
                      </Button>
                    </div>
                  )}
                </motion.div>
              </ErrorBoundary>

              {/* AI Recommendations Section */}
              <ErrorBoundary>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      AI Recommendations
                    </h2>
                  </div>
                  
                  <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Generate AI Scholarship Recommendations
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Our AI can analyze your profile and suggest personalized scholarship opportunities that match your academic background.
                    </p>
                    <Button
                      onClick={() => navigate('/results')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find Matching Scholarships
                    </Button>
                  </div>
                </div>
              </ErrorBoundary>
              
              {/* Deadlines Section */}
              <ErrorBoundary>
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md p-6 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
                    </div>
                    
                    {!isSubscribed && (
                      <PremiumFeatureGate
                        feature="Deadline Reminders"
                        description="Get notified before scholarship deadlines"
                        icon="bell"
                        showChildren={true}
                        blurChildren={false}
                      >
                        <Button
                          onClick={() => navigate('/plus')}
                          size="sm"
                          className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                        >
                          <Bell className="w-3 h-3 mr-1" />
                          Get Reminders
                        </Button>
                      </PremiumFeatureGate>
                    )}
                  </div>
                  
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDeadlines.map(scholarship => {
                        const daysLeft = getDaysRemaining(scholarship.deadline);
                        return (
                          <div
                            key={scholarship.id}
                            className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-shadow"
                            style={{
                              borderColor: daysLeft && daysLeft <= 7 
                                ? 'rgb(239, 68, 68)' 
                                : 'rgb(229, 231, 235)'
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {scholarship.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                daysLeft && daysLeft <= 7
                                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                                  : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                              }`}>
                                {daysLeft !== null ? `${daysLeft} days left` : 'No deadline'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {formatDate(scholarship.deadline)}
                            </p>
                            <Button
                              onClick={() => navigate(`/results`)}
                              variant="link"
                              className="mt-1 h-auto p-0 text-xs"
                            >
                              View Details
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-2">No upcoming deadlines</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                        Save scholarships to track their deadlines.
                      </p>
                      <Button
                        onClick={() => navigate('/results')}
                      >
                        Find Scholarships
                      </Button>
                    </div>
                  )}
                </motion.div>
              </ErrorBoundary>
            </div>
            
            {/* Right Column: Financial Resources */}
            <div>
              <ErrorBoundary>
                <motion.div
                  variants={itemVariants}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Resources</h2>
                  </div>
                  
                  {/* FAFSA Card */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">FAFSA 2025-2026</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          The FAFSA application for the 2025-2026 academic year opens on October 1, 2024.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open('https://studentaid.gov/h/apply-for-aid/fafsa', '_blank')}
                          className="text-sm"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plus-only Essay Assistance */}
                  {isSubscribed ? (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">AI Essay Assistance</h3>
                            <div className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                              Plus Feature
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Get AI-powered help with your scholarship essays and personal statements.
                          </p>
                          <Button
                            onClick={() => navigate('/essay-help')}
                            className="text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Try Essay Assistant
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Upgrade for AI Essay Assistance</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Upgrade to Plus to unlock AI-powered essay assistance for your scholarship applications.
                          </p>
                          <Button
                            onClick={() => navigate('/plus')}
                            className="text-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Upgrade Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </ErrorBoundary>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};