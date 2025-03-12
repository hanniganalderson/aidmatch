// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Bookmark, Calendar, Award, DollarSign, 
  ArrowRight, TrendingUp, Crown, Search, AlertCircle,
  CheckCircle, Lock, Bell, RefreshCw, Zap, FileText, PenTool, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { PremiumFeatureGate } from './ui/premiumFeatureGate';
import { FeatureLimitIndicator } from './ui/FeatureLimitIndicator';
import { FeatureName } from '../lib/feature-usage';
import type { UserAnswers, ScoredScholarship } from '../types';
import { ProtectedRoute } from './ProtectedRoute';
import { CheckoutButton } from './CheckoutButton';
import { SubscriptionBadge } from './ui/SubscriptionBadge';
import { PremiumFeature } from './ui/PremiumFeature';
import { PremiumDashboardHeader } from './PremiumDashboardHeader';
import { PremiumFeatureCard } from './ui/PremiumFeatureCard';
import { PremiumAccountSettings } from './PremiumAccountSettings';
import { ErrorBoundary } from './ErrorBoundary';
import { PremiumFeaturesShowcase } from './PremiumFeaturesShowcase';

interface DashboardProps {
  userAnswers?: UserAnswers;
}

export function Dashboard({ userAnswers }: DashboardProps) {
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  const { subscription } = useSubscription();
  const [hasAnswers, setHasAnswers] = useState(false);
  const [showQuestionnaireBanner, setShowQuestionnaireBanner] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    visible: { opacity: 1, y: 0 }
  };
  
  // Check if user has completed the questionnaire
  useEffect(() => {
    if (userAnswers) {
      const requiredFields = ['education_level', 'major', 'gpa'];
      const hasRequiredFields = requiredFields.every(field => 
        userAnswers[field as keyof UserAnswers] !== undefined && 
        userAnswers[field as keyof UserAnswers] !== null &&
        userAnswers[field as keyof UserAnswers] !== ''
      );
      
      setHasAnswers(hasRequiredFields);
      setShowQuestionnaireBanner(!hasRequiredFields);
    } else {
      setHasAnswers(false);
      setShowQuestionnaireBanner(true);
    }
  }, [userAnswers]);
  
  // Load saved scholarships
  useEffect(() => {
    const loadSavedScholarships = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_scholarships')
          .select('*')
          .eq('user_id', user.id)
          .limit(5);
          
        if (error) throw error;
        
        setSavedScholarships(data || []);
      } catch (err) {
        console.error('Error loading saved scholarships:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedScholarships();
  }, [user]);
  
  // Load AI recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user || !hasAnswers) return;
      
      try {
        // This would be replaced with your actual AI recommendation logic
        // For now, we'll just simulate some recommendations
        setAiRecommendations([
          {
            id: 'rec1',
            name: 'Engineering Excellence Scholarship',
            amount: 5000,
            deadline: '2025-05-15',
            description: 'For students pursuing engineering degrees with a GPA of 3.5 or higher.',
            match_score: 92,
            requirements: 'Engineering major, 3.5+ GPA',
            url: 'https://example.com/scholarship1'
          },
          {
            id: 'rec2',
            name: 'Future Leaders Grant',
            amount: 3000,
            deadline: '2025-04-30',
            description: 'Supporting students who demonstrate leadership potential.',
            match_score: 87,
            requirements: 'Leadership experience, essay required',
            url: 'https://example.com/scholarship2'
          },
          {
            id: 'rec3',
            name: 'STEM Women in Tech',
            amount: 7500,
            deadline: '2025-06-01',
            description: 'Encouraging women to pursue careers in technology fields.',
            match_score: 95,
            requirements: 'Female, STEM major',
            url: 'https://example.com/scholarship3'
          }
        ]);
      } catch (err) {
        console.error('Error loading recommendations:', err);
      }
    };
    
    loadRecommendations();
  }, [user, hasAnswers]);
  
  // Render saved scholarships section
  const renderSavedScholarshipsSection = () => {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Bookmark className="w-5 h-5 mr-2 text-indigo-500" />
            Saved Scholarships
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-600 dark:text-indigo-400"
            onClick={() => navigate('/saved-scholarships')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : savedScholarships.length > 0 ? (
          <div className="space-y-4">
            {savedScholarships.map(scholarship => (
              <div 
                key={scholarship.id}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {scholarship.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ${scholarship.amount.toLocaleString()} • Due: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-2 py-1 rounded">
                    {scholarship.match_score}% Match
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">No saved scholarships</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Save scholarships to track them here
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/results')}
            >
              Browse Scholarships
            </Button>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Render AI recommendations section
  const renderAIRecommendationsSection = () => {
    return (
      <div className="space-y-4">
        {!hasAnswers ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">Complete your profile</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Fill out the questionnaire to get personalized recommendations
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/questionnaire')}
            >
              Complete Profile
            </Button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : aiRecommendations.length > 0 ? (
          <div className="space-y-4">
            {aiRecommendations.map(scholarship => (
              <div 
                key={scholarship.id}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {scholarship.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ${scholarship.amount.toLocaleString()} • Due: {new Date(scholarship.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium px-2 py-1 rounded">
                    {scholarship.match_score}% Match
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/results')}
              >
                View All Matches
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-1">No recommendations yet</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              We're working on finding the perfect matches for you
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/results')}
            >
              Browse Scholarships
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Render financial resources section
  const renderFinancialResourcesSection = () => {
    return (
      <motion.div
        variants={itemVariants}
      >
        {isSubscribed ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <PenTool className="w-5 h-5 mr-2 text-indigo-500" />
                AI Essay Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Craft compelling scholarship essays with AI-powered assistance.
              </p>
              <Button
                onClick={() => navigate('/tools/essay-assistant')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Essay
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <DollarSign className="w-5 h-5 mr-2 text-indigo-500" />
                Financial Aid Optimizer
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Maximize your financial aid with AI-powered recommendations.
              </p>
              <Button
                onClick={() => navigate('/tools/financial-optimizer')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize Aid
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                Deadline Tracker
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Never miss an application deadline with our smart tracker.
              </p>
              <Button
                onClick={() => navigate('/tools/deadline-tracker')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Track Deadlines
              </Button>
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
    );
  };
  
  // Main component return
  return (
    <ProtectedRoute requireQuestionnaire={false} skipQuestionnaireCheck={true}>
      <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto"
          >
            {/* Gamified Dashboard Header */}
            <motion.div variants={itemVariants} className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                {isSubscribed ? "Your Plus Dashboard" : "Your Scholarship Journey"}
              </h1>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full mt-6 mb-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((savedScholarships.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {savedScholarships.length > 0 
                  ? `You've saved ${savedScholarships.length} scholarships! ${isSubscribed ? '✨ Plus member bonus: Unlimited saves!' : 'Upgrade to save unlimited scholarships!'}`
                  : "Start your journey by saving scholarships that match your profile!"}
              </p>
            </motion.div>
            
            {/* Core Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* AI Scholarship Results */}
              <motion.div 
                variants={itemVariants}
                className="feature-card flex flex-col h-full"
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)" }}
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Scholarship Matches</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  Discover scholarships tailored to your profile with our AI matching system.
                </p>
                <Button
                  onClick={() => navigate('/scholarships')}
                  className="w-full mt-auto"
                >
                  Find Matches
                </Button>
              </motion.div>
              
              {/* Saved Scholarships */}
              <motion.div 
                variants={itemVariants}
                className="feature-card flex flex-col h-full"
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)" }}
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Bookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Saved Scholarships</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {isSubscribed 
                    ? "Save unlimited scholarships with your Plus membership."
                    : "Save your favorite scholarships to apply later."}
                </p>
                <Button
                  onClick={() => navigate('/saved')}
                  className="w-full mt-auto"
                >
                  View Saved
                </Button>
              </motion.div>
              
              {/* Contribute Scholarships */}
              <motion.div 
                variants={itemVariants}
                className="feature-card flex flex-col h-full"
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)" }}
              >
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Contribute</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  Help others by adding scholarships to our database.
                </p>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => navigate('/contribute')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Contribute Scholarship</span>
                </Button>
              </motion.div>
            </div>
            
            {/* Plus Features Section (only shown to free users) */}
            {!isSubscribed && (
              <motion.div 
                variants={itemVariants}
                className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30"
              >
                <h2 className="text-2xl font-bold mb-4 text-center">Unlock Premium Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                    <h3 className="font-semibold mb-1">AI Essay Assistance</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get help writing winning scholarship essays</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <Bookmark className="w-8 h-8 text-green-500 mb-2" />
                    <h3 className="font-semibold mb-1">Unlimited Saves</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save as many scholarships as you want</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <FileText className="w-8 h-8 text-blue-500 mb-2" />
                    <h3 className="font-semibold mb-1">Auto-Fill Applications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Save time with automatic form filling</p>
                  </div>
                </div>
                <div className="text-center">
                  {isSubscribed ? (
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                      <Sparkles className="w-5 h-5" />
                      <span>Plus Member</span>
                    </div>
                  ) : (
                    <CheckoutButton 
                      size="lg"
                      variant="premium"
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition-colors shadow-md"
                    />
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Recent Activity Feed (for Plus users) */}
            {isSubscribed && (
              <motion.div variants={itemVariants} className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">You saved "Engineering Scholarship"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Essay Assistant used</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">You upgraded to Plus!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}