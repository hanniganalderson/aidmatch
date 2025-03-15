// src/components/AIRecommendationSection.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, Crown, RefreshCw, Award, Zap, ArrowRight } from 'lucide-react';
import { PremiumFeatureGate } from './ui/premiumFeatureGate';
import { FeatureLimitIndicator } from './ui/FeatureLimitIndicator';
import { useFeatureUsage } from '../hooks/useFeatureUsage';
import { getAIScholarshipRecommendations } from '../lib/AIScholarshipService';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import type { ScoredScholarship, UserAnswers } from '../types';
import { FeatureName } from '../lib/feature-management';

interface ScholarshipCardProps {
  scholarship: ScoredScholarship;
}

const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  return (
    <div>
      <h3>{scholarship.name}</h3>
      <p>{scholarship.description}</p>
    </div>
  );
};

interface AIRecommendationSectionProps {
  userAnswers: UserAnswers;
  className?: string;
  maxResults?: number;
}

export function AIRecommendationSection({ 
  userAnswers, 
  className = '',
  maxResults = 3
}: AIRecommendationSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [scholarships, setScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  
  const { 
    incrementUsage, 
    hasReachedLimit, 
    canUseFeature, 
    loading: usageLoading 
  } = useFeatureUsage(FeatureName.AI_RECOMMENDATIONS);
  
  // Check if we have required profile data to generate recommendations
  const hasRequiredData = 
    userAnswers.education_level && 
    userAnswers.major && 
    userAnswers.gpa;
  
  // Generate recommendations
  const generateRecommendations = async () => {
    // Check if user can use feature (if not subscribed)
    if (!isSubscribed && !canUseFeature) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Track usage if not subscribed
      if (!isSubscribed) {
        await incrementUsage();
      }
      
      // Get AI recommendations with subscription status
      const recommendations = await getAIScholarshipRecommendations(
        userAnswers,
        isSubscribed ? maxResults * 2 : maxResults, // More results for subscribers
        isSubscribed // Pass subscription status
      );
      
      if (recommendations.length === 0) {
        setError('No recommendations found. Please try again or update your profile.');
      } else {
        setScholarships(recommendations);
      }
    } catch (err) {
      console.error('Error generating AI recommendations:', err);
      setError('An error occurred while generating recommendations.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get initial recommendations on load if we have data
  useEffect(() => {
    // Only auto-generate if we have data and no recommendations yet
    if (hasRequiredData && scholarships.length === 0 && !error) {
      // Don't auto-generate for free users who are out of uses
      if (isSubscribed || canUseFeature) {
        generateRecommendations();
      }
    }
  }, [hasRequiredData, isSubscribed]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  
  // Loading state
  if (usageLoading) {
    return (
      <div className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // Render main content
  return (
    <div className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Recommendations
            </h2>
          </div>
          
          {!isSubscribed && (
            <FeatureLimitIndicator 
              featureName={FeatureName.AI_RECOMMENDATIONS}
              variant="inline"
              className="mt-2 sm:mt-0"
            />
          )}
        </motion.div>
        
        {/* Feature gate for free users who've reached their limit */}
        {hasReachedLimit ? (
          <PremiumFeatureGate
            feature="AI Scholarship Recommendations"
            description="Get unlimited, personalized AI scholarship matches tailored to your academic profile."
            icon="sparkles"
          >
            <div className="p-8 text-center">
              <motion.div
                variants={itemVariants}
                className="mb-4"
              >
                <Crown className="w-10 h-10 text-purple-500 mx-auto" />
              </motion.div>
              <motion.h3
                variants={itemVariants}
                className="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                Unlock Premium AI Recommendations
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-400 mb-6"
              >
                Upgrade to Plus for unlimited AI-powered scholarship matches tailored specifically to your profile.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Plus
                </Button>
              </motion.div>
            </div>
          </PremiumFeatureGate>
        ) : (
          <>
            {/* Show incomplete profile message if needed */}
            {!hasRequiredData && (
              <motion.div
                variants={itemVariants}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-amber-800 dark:text-amber-200 font-medium">Complete your profile</p>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      We need more information to generate accurate AI recommendations for you.
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
              </motion.div>
            )}
            
            {/* Error message if any */}
            {error && (
              <motion.div
                variants={itemVariants}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-medium">Error generating recommendations</p>
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    <Button
                      onClick={generateRecommendations}
                      variant="link"
                      className="text-red-600 dark:text-red-400 p-0 h-auto mt-1"
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Try Again'}
                      {!loading && <RefreshCw className="w-3.5 h-3.5 ml-1.5" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Loading state while generating */}
            {loading ? (
              <motion.div
                variants={itemVariants}
                className="p-12 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Generating AI Recommendations</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md text-center">
                  {isSubscribed
                    ? "Our AI is analyzing thousands of scholarships to find your perfect matches..."
                    : "Using 1 of your 5 free monthly AI recommendations..."}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Scholarship results */}
                {scholarships.length > 0 ? (
                  <motion.div variants={itemVariants}>
                    <div className={`space-y-4 ${generated ? '' : 'max-h-[600px] overflow-hidden'}`}>
                      {scholarships.slice(0, generated ? undefined : maxResults).map((scholarship, index) => (
                        <ScholarshipCard
                          key={scholarship.id.toString()}
                          scholarship={scholarship}
                        />
                      ))}
                    </div>
                    
                    {/* Show more/less and regenerate buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
                      {scholarships.length > maxResults && (
                        <Button
                          onClick={() => setGenerated(!generated)}
                          variant="outline"
                        >
                          {generated ? 'Show Less' : `Show ${scholarships.length - maxResults} More`}
                        </Button>
                      )}
                      
                      <Button
                        onClick={generateRecommendations}
                        disabled={loading}
                        className={isSubscribed ? 
                          "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90" : 
                          ""}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate New Recommendations
                      </Button>
                    </div>
                    
                    {/* Premium upsell for free users */}
                    {!isSubscribed && (
                      <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
                            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Get More with Plus
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Upgrade to unlock unlimited AI recommendations and find even more matching scholarships.
                            </p>
                          </div>
                          <div className="ml-auto">
                            <Button
                              onClick={() => navigate('/pricing')}
                              size="sm"
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              Upgrade
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    variants={itemVariants}
                    className="p-12 text-center"
                  >
                    {hasRequiredData ? (
                      <>
                        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Generate AI Scholarship Recommendations
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          Our AI can analyze your profile and suggest personalized scholarship opportunities that match your academic background.
                        </p>
                        <Button
                          onClick={generateRecommendations}
                          className={`${isSubscribed ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : ""}`}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Recommendations
                        </Button>
                      </>
                    ) : (
                      <>
                        <Award className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Complete Your Profile First
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                          We need information about your education, major, and GPA to generate accurate AI recommendations.
                        </p>
                        <Button
                          onClick={() => navigate('/questionnaire')}
                        >
                          Complete Questionnaire
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}