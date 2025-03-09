import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Bookmark,
  Calendar,
  Award,
  DollarSign,
  Pencil,
  ArrowRight,
  Check,
  AlertCircle,
  BookOpen,
  School,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { UserAnswers, ScoredScholarship } from '../types';

/**
 * Minimal, animated Dashboard featuring:
 * - Condensed profile or 'incomplete profile' alert
 * - 4 core card sections: Saved Scholarships, Deadlines, Grants, Aid & Savings
 * - Intersection Observer for smooth fade/slide animations
 */

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

  // Saved scholarships
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // On mount or user change, fetch user profile & saved scholarships
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSavedScholarships();
    } else {
      setLoading(false);
    }
  }, [user]);

  // If userAnswers prop is provided, update local userProfile
  useEffect(() => {
    if (userAnswers) {
      setUserProfile(userAnswers);
    }
  }, [userAnswers]);

  // Determine if profile is complete
  const isProfileComplete = Boolean(
    userProfile.education_level &&
    userProfile.school &&
    userProfile.major &&
    userProfile.gpa &&
    userProfile.location
  );

  // Fetch user profile from Supabase
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

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

  // Fetch saved scholarships
  const fetchSavedScholarships = async () => {
    try {
      setLoading(true);
      const { data: savedData, error: savedError } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user?.id);

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
            score: 95 // Placeholder
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

  // Simple date formatting
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Days remaining
  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Intersection Observer for fade/slide animations
  const [dashboardRef, dashboardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Container and item variants for motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
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
          {/* Profile or incomplete alert */}
          {!isProfileComplete ? (
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
                  {user?.user_metadata?.name
                    ? user.user_metadata.name.charAt(0).toUpperCase()
                    : 'S'}
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
                    <div className="font-medium text-gray-900 dark:text-white">
                      {userProfile.education_level}
                    </div>
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
              {/* Edit */}
              <button
                onClick={() => navigate('/questionnaire')}
                className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
            </motion.div>
          )}

          {/* Main grid: 2x2 layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Saved Scholarships */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Saved Scholarships</h2>
                </div>
                <button
                  onClick={() => navigate('/saved-scholarships')}
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
              ) : savedScholarships.length > 0 ? (
                <div className="space-y-3">
                  {savedScholarships.slice(0, 3).map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {sch.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Amount: ${sch.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() => navigate(`/scholarship/${sch.id}`)}
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
                  No saved scholarships
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
              ) : savedScholarships.length > 0 ? (
                <div className="space-y-3">
                  {savedScholarships
                    .filter(s => s.deadline)
                    .sort(
                      (a, b) =>
                        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
                    )
                    .slice(0, 3)
                    .map((sch) => {
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

            {/* Grant Opportunities */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Grant Opportunities
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Federal Pell Grant
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Up to $7,395
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  </div>
                </div>
                <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        FSEOG
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Up to $4,000 for exceptional financial need
                      </p>
                    </div>
                    <button className="text-xs text-green-500 hover:text-green-600">
                      Check
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Financial Aid & Savings */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Financial Aid & Savings
                </h2>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        AOTC
                      </h3>
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
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        529 Savings
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Tax-advantaged plan for education expenses
                      </p>
                    </div>
                    <Check className="w-4 h-4 text-purple-500 mt-0.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}