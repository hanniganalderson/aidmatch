import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Bookmark, Search, Edit,
  ArrowRight, Crown, PlusCircle, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useSavedScholarships } from '../hooks/useScholarshipMatching';
import { createCheckoutSession } from '../lib/subscriptionService';
import { supabase } from '../lib/supabase';

export function FreeDashboard() {
  const navigate = useNavigate();
  const { user, getUserDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const { savedScholarships } = useSavedScholarships(user?.id);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(getUserDisplayName());
      fetchUserProfile();
    }
  }, [user, getUserDisplayName]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
        duration: 0.5
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      navigate('/plus');
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {displayName}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Profile
                </h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</span>
                  </div>
                  {userProfile?.education_level && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Education:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.education_level}</span>
                    </div>
                  )}
                  {userProfile?.major && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Major:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.major}</span>
                    </div>
                  )}
                </div>
              )}
              
              <Button
                onClick={() => navigate('/settings')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </Card>
          </motion.div>
          
          {/* Find Scholarships Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Find Scholarships
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Discover scholarships that match your profile and interests.
              </p>
              
              <Button
                onClick={() => navigate('/questionnaire')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Scholarships
              </Button>
            </Card>
          </motion.div>
          
          {/* Saved Scholarships Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Saved Scholarships
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have {savedScholarships?.length || 0} saved scholarships.
              </p>
              
              <Button
                onClick={() => navigate('/saved')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                View Saved Scholarships
              </Button>
            </Card>
          </motion.div>
          
          {/* Contribute Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contribute
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Help others by adding scholarships to our database.
              </p>
              
              <Button
                onClick={() => navigate('/contribute')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Add Scholarship
              </Button>
            </Card>
          </motion.div>
        </div>
        
        {/* Upgrade Banner - Single, subtle promotion */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                  Unlock Premium Features
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Get unlimited access to AI essay assistance, advanced matching, and more.
                </p>
              </div>
              
              <Button 
                onClick={handleUpgrade}
                className="whitespace-nowrap bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Upgrade to Plus
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}