import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Bookmark, Calendar, Award, DollarSign, 
  ArrowRight, TrendingUp, Crown, Search, AlertCircle,
  CheckCircle, Bell, RefreshCw, Zap, FileText, PenTool,
  BarChart, Clock, Lightbulb, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useSavedScholarships } from '../hooks/useScholarshipMatching';
import { supabase } from '../lib/supabase';
import type { ScoredScholarship } from '../types';
import { EssayAssistant } from './EssayAssistant';

// Rename from PremiumDashboard to PlusDashboard to match import in Dashboard.tsx
export function PlusDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [topScholarships, setTopScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedScholarships, toggleSave, isSaving } = useSavedScholarships(user?.id);
  const [essayProgress, setEssayProgress] = useState(68);
  const [deadlines, setDeadlines] = useState([
    { id: 1, name: 'Engineering Scholarship', date: '2023-12-15', daysLeft: 12 },
    { id: 2, name: 'Women in STEM Grant', date: '2023-12-20', daysLeft: 17 },
    { id: 3, name: 'Community Service Award', date: '2024-01-05', daysLeft: 33 }
  ]);

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
          .limit(5);
          
        if (error) throw error;
        // Transform to ScoredScholarship type
        const scholarships: ScoredScholarship[] = data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          deadline: item.deadline,
          provider: item.provider, // Added missing provider field
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div 
            variants={itemVariants}
            className="rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 relative overflow-hidden">
              {/* Premium background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center mb-3">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Plus Member</span>
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome back, {user?.user_metadata?.name || 'Scholar'}!
                  </h1>
                  <p className="text-indigo-100 max-w-2xl">
                    You have unlimited access to all premium features. Here's your personalized dashboard.
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="text-white text-sm mb-1">Your Plus membership is active</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-white text-xs">Premium Access</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Navigation */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-6 border border-indigo-100 dark:border-indigo-800/30"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Crown className="w-4 h-4 mr-2 text-indigo-600" />
                  Plus Dashboard
                </h2>
                
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="mr-3">🏠</span>
                    Overview
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('scholarships')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'scholarships' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="mr-3">🎓</span>
                    My Scholarships
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('essays')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'essays' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="mr-3">✍️</span>
                    AI Essay Helper
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('financial')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'financial' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="mr-3">💰</span>
                    Financial Aid
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('deadlines')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'deadlines' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className="mr-3">📅</span>
                    Deadline Tracker
                  </button>
                </nav>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-6 border border-indigo-100 dark:border-indigo-800/30"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Stats
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                        <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Saved Scholarships</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {savedScholarships.length} <span className="text-xs text-indigo-600">Unlimited</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Potential Aid</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">$78,500</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Applications</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">5/12</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-indigo-100 dark:border-indigo-800/30"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Bell className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Upcoming Deadlines
                </h2>
                
                <div className="space-y-3">
                  {deadlines.map(deadline => (
                    <div 
                      key={deadline.id}
                      className={`p-3 rounded-lg ${
                        deadline.daysLeft < 15 
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30' 
                          : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                            {deadline.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {new Date(deadline.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${
                          deadline.daysLeft < 15 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {deadline.daysLeft} days left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
