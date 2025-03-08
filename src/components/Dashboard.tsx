import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, Award, ArrowRight, CheckCircle, Settings, X, 
  Bell, FileText, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useInView } from 'react-intersection-observer';
import type { ScoredScholarship, UserAnswers } from '../types';

export function Dashboard({ userAnswers }: { userAnswers?: UserAnswers }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Dashboard preferences with default values
  const [dashboardPreferences, setDashboardPreferences] = useState({
    showDeadlines: true,
    showNotifications: true,
    showGrants: true
  });

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
      transition: { duration: 0.5 }
    }
  };

  // Using intersection observer for animations
  const [dashboardRef, dashboardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Fetch saved scholarships on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchSavedScholarships();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedScholarships = async () => {
    try {
      setLoading(true);
      // Get saved scholarship IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user?.id);
      
      if (savedError) throw savedError;

      if (savedData && savedData.length > 0) {
        const savedIds = savedData.map(item => item.scholarship_id);
        // Then get scholarship details
        const { data: scholarshipsData, error: scholarshipsError } = await supabase
          .from('scholarships')
          .select('*')
          .in('id', savedIds);
        
        if (scholarshipsError) throw scholarshipsError;
        
        if (scholarshipsData) {
          const scoredScholarships: ScoredScholarship[] = scholarshipsData.map(s => ({
            ...s,
            score: 95 // Placeholder score
          }));
          setSavedScholarships(scoredScholarships);
        }
      }
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate days remaining
  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Toggle dashboard preferences
  const togglePreference = (preference: keyof typeof dashboardPreferences) => {
    setDashboardPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-green-50 to-teal-100 dark:from-gray-900 dark:to-teal-950">
      <div className="container mx-auto px-4">
        <motion.div
          ref={dashboardRef}
          initial="hidden"
          animate={dashboardInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-5xl mx-auto"
        >
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Your Progress</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Financial Aid Dashboard
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Dashboard Settings
                      </h3>
                      <button 
                        onClick={() => setSettingsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={dashboardPreferences.showDeadlines}
                          onChange={() => togglePreference('showDeadlines')}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span>Show Deadlines</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={dashboardPreferences.showNotifications}
                          onChange={() => togglePreference('showNotifications')}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span>Show Notifications</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={dashboardPreferences.showGrants}
                          onChange={() => togglePreference('showGrants')}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span>Show Grant Opportunities</span>
                      </label>
                    </div>
                    
                    <button
                      onClick={() => navigate('/questionnaire')}
                      className="w-full py-2 px-4 rounded-md bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content (Left and Center) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Deadlines */}
              {dashboardPreferences.showDeadlines && (
                <motion.div variants={itemVariants}>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
                      </div>
                      <button
                        onClick={() => navigate('/results')}
                        className="flex items-center gap-1 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : savedScholarships.length > 0 ? (
                      <div className="space-y-4">
                        {savedScholarships
                          .filter(s => s.deadline)
                          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                          .slice(0, 4)
                          .map(scholarship => {
                            const daysRemaining = getDaysRemaining(scholarship.deadline);
                            return (
                              <div key={scholarship.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {scholarship.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(scholarship.deadline)}
                                  </p>
                                </div>
                                <div className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  daysRemaining !== null && daysRemaining <= 7
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                }`}>
                                  {daysRemaining !== null ? `${daysRemaining} days left` : 'No deadline'}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">No saved scholarships</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start exploring scholarships that match your profile</p>
                        <button
                          onClick={() => navigate('/results')}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                        >
                          Find Scholarships
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* Grant Opportunities */}
              {dashboardPreferences.showGrants && (
                <motion.div variants={itemVariants}>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 mb-6">
                      <Award className="w-5 h-5 text-primary-500" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grant Opportunities</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Federal Pell Grant</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 mb-2">Awarded - Up to $7,395</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Need-based federal grant for undergraduate students.
                            </p>
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded">
                            Awarded
                          </div>
                        </div>
                      </div>
                      
                      {userAnswers?.location && (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{userAnswers.location} State Grant</h3>
                              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Eligible - Up to $4,000</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                State-based grant for {userAnswers.location} residents.
                              </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                              Eligible
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">FSEOG Grant</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Check Eligibility</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Federal Supplemental Educational Opportunity Grant for students with exceptional financial need.
                            </p>
                          </div>
                          <button className="text-primary-500 hover:text-primary-600 text-xs font-medium">
                            Check Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Notifications (Right) */}
            {dashboardPreferences.showNotifications && (
              <motion.div 
                variants={itemVariants}
                className="space-y-8"
              >
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary-500" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                    </div>
                    <div className="bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      3 new
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-l-4 border-primary-500 bg-blue-50 dark:bg-blue-900/20 dark:border-primary-500">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-primary-500 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">FAFSA Update</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            The FAFSA application period for 2025-2026 is now open.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">2 days ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Deadline Alert</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            The Merit Scholarship deadline is in 5 days.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">1 day ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-500">
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">New Match Found</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            A new scholarship matching your profile is available.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button 
                      className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
                
                {/* FAFSA Status */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-primary-500" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">FAFSA Status</h2>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30 mb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-700 dark:text-green-400">FAFSA Submitted</h3>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          Your FAFSA for 2025-2026 has been processed.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Application Date:</span>
                      <span className="text-gray-900 dark:text-white">October 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">EFC:</span>
                      <span className="text-gray-900 dark:text-white">$5,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-green-600 dark:text-green-400">Complete</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}