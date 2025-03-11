import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Sparkles, Bookmark, Calendar, Award, DollarSign, Pencil, ArrowRight,
  Check, AlertCircle, TrendingUp, MapPin, Zap, RefreshCw, LogIn, FileText, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  getAIScholarshipRecommendations,
  getCachedAIScholarships
} from '../lib/AIScholarshipService';
import type { UserAnswers, ScoredScholarship } from '../types';
import { Button } from './ui/button';

export function Dashboard({ userAnswers }: { userAnswers?: UserAnswers }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local user profile state
  const [userProfile, setUserProfile] = useState<UserAnswers>({
    education_level: '',
    school: '',
    major: '',
    gpa: '',
    location: ''
  });

  // Scholarships state
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [aiScholarships, setAiScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch user profile, saved scholarships, and cached AI recommendations on mount/user change
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSavedScholarships();
      const cachedAI = getCachedAIScholarships();
      if (cachedAI.length > 0) {
        setAiScholarships(cachedAI);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  // Update userProfile if userAnswers prop is provided
  useEffect(() => {
    if (userAnswers) {
      setUserProfile(userAnswers);
    }
  }, [userAnswers]);

  // Determine if the profile is complete
  const isProfileComplete = Boolean(
    userProfile.education_level &&
      userProfile.school &&
      userProfile.major &&
      userProfile.gpa &&
      userProfile.location
  );

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .throwOnError();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setUserProfile({
          education_level: data.education_level || '',
          school: data.school || '',
          major: data.major || '',
          gpa: data.gpa || '',
          location: data.location || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch saved scholarships from Supabase
  const fetchSavedScholarships = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: savedData, error: savedError } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;
      if (savedData && savedData.length > 0) {
        const savedIds = savedData.map(item => item.scholarship_id);
        const { data: scholarshipsData, error: scholarshipsError } = await supabase
          .from('scholarships')
          .select('*')
          .in('id', savedIds);

        if (scholarshipsError) throw scholarshipsError;
        if (scholarshipsData) {
          const scored: ScoredScholarship[] = scholarshipsData.map(s => ({
            ...s,
            score: 95 // Placeholder score
          }));
          setSavedScholarships(scored);
        }
      }
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI scholarship recommendations
  const generateAIRecommendations = async () => {
    if (aiLoading || !isProfileComplete || !user) {
      if (!user) {
        navigate('/signin');
      }
      return;
    }
    
    setAiLoading(true);
    try {
      const recommendations = await getAIScholarshipRecommendations(userProfile, 3);
      if (recommendations.length > 0) {
        setAiScholarships(recommendations);
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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

  // Intersection Observer for animations
  const [dashboardRef, dashboardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Render guest welcome message when not logged in
  const renderGuestWelcome = () => (
    <motion.div
      variants={itemVariants}
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400">
          <UserPlus className="w-7 h-7" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Welcome to AidMatch
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in or create an account to unlock personalized scholarship recommendations
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => navigate('/signin')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
        <Button
          onClick={() => navigate('/signup')}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          ref={dashboardRef}
          initial="hidden"
          animate={dashboardInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Guest Welcome or User Profile */}
          {!user ? (
            renderGuestWelcome()
          ) : !isProfileComplete ? (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800/30 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">
                  Your profile is incomplete. Fill out the questionnaire to get better matches.
                </p>
              </div>
              <button
                onClick={() => navigate('/questionnaire')}
                className="px-4 py-2 text-sm font-medium rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Complete Profile
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'S'}
                </div>
                {/* Basic info */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.user_metadata?.name || 'Student'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>
              {/* Stats row */}
              <div className="flex items-center gap-6">
                {userProfile.education_level && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
                    <div className="font-medium text-gray-900 dark:text-white">{userProfile.education_level}</div>
                  </div>
                )}
                {userProfile.major && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Major</div>
                    <div className="font-medium text-gray-900 dark:text-white">{userProfile.major}</div>
                  </div>
                )}
                {userProfile.gpa && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">GPA</div>
                    <div className="font-medium text-gray-900 dark:text-white">{userProfile.gpa}</div>
                  </div>
                )}
                {userProfile.location && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">State</div>
                    <div className="font-medium text-gray-900 dark:text-white">{userProfile.location}</div>
                  </div>
                )}
              </div>
              {/* Edit Profile */}
              <button
                onClick={() => navigate('/questionnaire')}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </motion.div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left & Center Columns: Scholarship Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Verified Scholarships */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Verified Scholarships</h2>
                  </div>
                  <button
                    onClick={() => navigate('/results')}
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !user ? (
                  <div className="text-center py-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                    <FileText className="w-14 h-14 mx-auto text-blue-400 mb-2" />
                    <h3 className="text-gray-900 dark:text-white font-medium mb-2">Track Your Scholarships</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-4">
                      Sign in to save scholarships and track their deadlines in one place
                    </p>
                    <Button
                      onClick={() => navigate('/signin')}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
                    >
                      Sign In to Save
                    </Button>
                  </div>
                ) : savedScholarships.length > 0 ? (
                  <div className="space-y-3">
                    {savedScholarships.slice(0, 3).map(sch => (
                      <div
                        key={sch.id}
                        className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                          {sch.name}
                        </h3>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Amount: ${sch.amount.toLocaleString()}
                          </p>
                          {sch.deadline && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Deadline: {formatDate(sch.deadline)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/results`)}
                          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {savedScholarships.length > 3 && (
                      <button
                        onClick={() => navigate('/saved-scholarships')}
                        className="w-full text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        +{savedScholarships.length - 3} more saved
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No saved scholarships yet
                  </div>
                )}
              </motion.div>

              {/* AI-Powered Recommendations */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Recommendations</h2>
                  </div>
                  <button
                    onClick={() => navigate('/results?tab=ai')}
                    className="text-sm text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {!user ? (
                  <div className="text-center py-10 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <Sparkles className="w-14 h-14 mx-auto text-purple-400 mb-2" />
                    <h3 className="text-gray-900 dark:text-white font-medium mb-2">AI Scholarship Matching</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-4">
                      Sign in to get personalized AI-powered scholarship recommendations based on your profile
                    </p>
                    <Button
                      onClick={() => navigate('/signin')}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
                    >
                      Sign In for AI Matches
                    </Button>
                  </div>
                ) : !isProfileComplete ? (
                  <div className="text-center py-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-2" />
                    <h3 className="text-gray-900 dark:text-white font-medium mb-2">Complete your profile</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-4">
                      Fill out your profile information to get personalized AI scholarship recommendations.
                    </p>
                    <Button
                      onClick={() => navigate('/questionnaire')}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
                    >
                      Complete Profile
                    </Button>
                  </div>
                ) : aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">
                      Generating recommendations with AI...
                    </p>
                  </div>
                ) : aiScholarships.length > 0 ? (
                  <div className="space-y-3">
                    {aiScholarships.slice(0, 3).map(sch => (
                      <div
                        key={sch.id}
                        className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {sch.name}
                          </h3>
                          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full px-2 py-0.5 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Amount: ${sch.amount.toLocaleString()}
                          </p>
                          {sch.deadline && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Deadline: {formatDate(sch.deadline)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate('/results?tab=ai')}
                          className="text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                        >
                          Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={generateAIRecommendations}
                        size="sm"
                        className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30 flex items-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Refresh Recommendations
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                    <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-2" />
                    <h3 className="text-gray-900 dark:text-white font-medium mb-2">AI Recommendations</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-4">
                      Get personalized scholarship suggestions based on your profile.
                    </p>
                    <Button
                      onClick={generateAIRecommendations}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Recommendations
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Upcoming Deadlines */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
                  </div>
                  <button
                    onClick={() => navigate('/results')}
                    className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !user ? (
                  <div className="text-center py-10 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                    <Calendar className="w-14 h-14 mx-auto text-red-400 mb-2" />
                    <h3 className="text-gray-900 dark:text-white font-medium mb-2">Track Application Deadlines</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto mb-4">
                      Create an account to never miss a scholarship application deadline
                    </p>
                    <Button
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90"
                    >
                      Create Account
                    </Button>
                  </div>
                ) : savedScholarships.length > 0 ? (
                  <div className="space-y-3">
                    {savedScholarships
                      .filter(s => s.deadline)
                      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                      .slice(0, 3)
                      .map(sch => {
                        const daysLeft = getDaysRemaining(sch.deadline);
                        return (
                          <div
                            key={sch.id}
                            className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-red-300 dark:hover:border-red-600 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                {sch.name}
                              </h3>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  daysLeft !== null && daysLeft <= 7
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                }`}
                              >
                                {daysLeft !== null ? `${daysLeft} days` : 'No deadline'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(sch.deadline)}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    No upcoming deadlines
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Financial Aid & Grants, Aid Tips, and FAFSA */}
            <div className="space-y-6">
              {/* Grant Opportunities */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Grant Opportunities</h2>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Federal Pell Grant</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Up to $7,395</p>
                      </div>
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    </div>
                  </div>
                  <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">FSEOG</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Up to $4,000 for exceptional financial need
                        </p>
                      </div>
                      <button className="text-xs text-green-500 hover:text-green-600">Check</button>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/results')}
                    className="w-full text-sm text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 flex items-center justify-center gap-1 mt-2"
                  >
                    Find More Grants
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Financial Aid & Savings */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Aid & Savings</h2>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AOTC</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          American Opportunity Tax Credit (up to $2,500)
                        </p>
                      </div>
                      <Check className="w-4 h-4 text-purple-500 mt-0.5" />
                    </div>
                  </div>
                  <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">529 Savings</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Tax-advantaged plan for education expenses
                        </p>
                      </div>
                      <Check className="w-4 h-4 text-purple-500 mt-0.5" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Financial Aid Tips */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Aid Tips</h2>
                </div>
                <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-yellow-50/50 dark:bg-yellow-900/10 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Submit FAFSA Early</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Many scholarships and grants are first-come, first-served. Submit your FAFSA as soon as possible.
                  </p>
                </div>
                <div className="p-3 mt-3 rounded-md border border-gray-200 dark:border-gray-700 bg-yellow-50/50 dark:bg-yellow-900/10 hover:border-yellow-300 dark:hover:border-yellow-600 transition-colors">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Apply to Many Scholarships</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Don't limit yourself. The more scholarships you apply to, the better your chances.
                  </p>
                </div>
              </motion.div>

              {/* FAFSA Info Card */}
              <motion.div
                variants={itemVariants}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">2025-2026 FAFSA</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  The FAFSA application for the 2025-2026 academic year opens on October 1, 2024.
                </p>
                <Button
                  onClick={() => window.open('https://studentaid.gov/h/apply-for-aid/fafsa', '_blank')}
                  className="bg-blue-500 hover:bg-blue-600 w-full flex items-center justify-center gap-2"
                >
                  <span>Prepare for FAFSA</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}