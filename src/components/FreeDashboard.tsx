import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Bookmark, Calendar, Award, DollarSign, 
  ArrowRight, Crown, Search, AlertCircle, Lock, 
  PenTool, FileText, Zap, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScholarshipCard } from './ScholarshipCard';
import { useSavedScholarships } from '../hooks/useScholarshipMatching';
import { supabase } from '../lib/supabase';
import type { ScoredScholarship } from '../types';

export function FreeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [topScholarships, setTopScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedScholarships, toggleSave, isSaving } = useSavedScholarships(user?.id);

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

  // Fetch top scholarships
  useEffect(() => {
    const fetchTopScholarships = async () => {
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        // Transform to ScoredScholarship type
        const scholarships: ScoredScholarship[] = data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          deadline: item.deadline,
          description: item.description,
          requirements: item.requirements,
          url: item.url,
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          match_score: Math.floor(Math.random() * 30) + 70
        }));
        
        setTopScholarships(scholarships);
      } catch (err) {
        console.error('Error fetching scholarships:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopScholarships();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Futuristic Border */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative mb-8"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-2xl"></div>
            
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.user_metadata?.name || 'Scholar'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your saved scholarships and find new opportunities.
              </p>
            </div>
          </motion.div>
          
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Saved Scholarships */}
            <motion.div 
              variants={containerVariants}
              className="lg:col-span-2"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative"
              >
                {/* Decorative border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Bookmark className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                    Your Saved Scholarships
                  </h2>
                  
                  {/* Saved scholarships content */}
                  {savedScholarships.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved scholarships yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Start exploring to find and save scholarships that match your profile.
                      </p>
                      <Button
                        onClick={() => navigate('/questionnaire')}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      >
                        Find Scholarships
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Saved scholarship cards */}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Profile & Features */}
            <motion.div 
              variants={containerVariants}
              className="space-y-6"
            >
              {/* Profile Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative"
              >
                {/* Decorative border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Profile
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Account Type</span>
                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Free
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Saved Scholarships</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {savedScholarships.length}/3
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/settings')}
                      className="w-full mt-2"
                    >
                      Manage Profile
                    </Button>
                  </div>
                </div>
              </motion.div>
              
              {/* Features Card - More Subtle */}
              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-750 rounded-xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-900/20 relative"
              >
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                    Scholarship Tools
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Essay Assistant</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered writing help</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Financial Aid</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Maximize your funding</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Deadline Tracker</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Never miss a deadline</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 