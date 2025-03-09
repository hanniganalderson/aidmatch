import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen, Bookmark, Building, Calculator, 
  CreditCard, ExternalLink, GraduationCap, Landmark, 
  MapPin, PiggyBank, ReceiptCent, School, TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';
import type { ScoredScholarship, UserAnswers } from '../types';

type Grant = {
  name: string;
  amount: string;
  provider: string;
  description: string;
  eligibility: string;
  link: string;
  status: string;
};

type SavingsOpportunity = {
  name: string;
  amount: string;
  description: string;
  eligibility: string;
  icon: any;
  link: string;
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedScholarships, setSavedScholarships] = useState<ScoredScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserAnswers>({
    education_level: '',
    school: '',
    major: '',
    gpa: '',
    location: ''
  });
  
  // Dashboard preferences with default values
  const [dashboardPreferences, setDashboardPreferences] = useState({
    showDeadlines: true,
    showNotifications: true,
    showGrants: true,
    showSavings: true
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
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

  // Using intersection observer for animations
  const [dashboardRef, dashboardInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Fetch user profile and saved scholarships on mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSavedScholarships();
    } else {
      setLoading(false);
      setProfileLoading(false);
    }
  }, [user]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Update user profile state with profile data (removed is_pell_eligible)
        setUserProfile({
          education_level: data.education_level || '',
          school: data.school || '',
          major: data.major || '',
          gpa: data.gpa || '',
          location: data.location || ''
        });
        
        // Also update dashboard preferences if available
        if (data.dashboard_preferences) {
          try {
            // Handle case where preferences might be stored as a string
            const preferences = typeof data.dashboard_preferences === 'string' 
              ? JSON.parse(data.dashboard_preferences)
              : data.dashboard_preferences;
              
            setDashboardPreferences(prev => ({
              ...prev,
              ...(preferences || {})
            }));
          } catch (e) {
            console.error('Error parsing dashboard preferences:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

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
    const newPreferences = {
      ...dashboardPreferences,
      [preference]: !dashboardPreferences[preference]
    };
    
    setDashboardPreferences(newPreferences);
    
    // Save preferences to user profile
    if (user) {
      supabase
        .from('user_profiles')
        .update({ 
          dashboard_preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Error saving dashboard preferences:', error);
        });
    }
  };

  // Calculate if profile is complete and prompt completion if needed
  const isProfileComplete = !!(
    userProfile.education_level && 
    userProfile.school && 
    userProfile.major && 
    userProfile.gpa && 
    userProfile.location
  );

  // Get grants based on user's state and education level
  const getStateGrants = () => {
    const state = userProfile.location;
    const isCollegeStudent = userProfile.education_level && 
      !userProfile.education_level.toLowerCase().includes('high school');
    
    const isGraduateStudent = userProfile.education_level && 
      (userProfile.education_level.toLowerCase().includes('graduate') || 
       userProfile.education_level.toLowerCase().includes('phd'));
    
    const grants: Grant[] = [];
    
    // State-specific grants
    if (state === 'Oregon') {
      if (isCollegeStudent && !isGraduateStudent) {
        grants.push({
          name: 'Oregon Opportunity Grant',
          amount: 'Up to $3,600',
          provider: 'Oregon Office of Student Access and Completion',
          description: 'Need-based grant for Oregon residents attending Oregon colleges',
          eligibility: 'Oregon resident with demonstrated financial need',
          link: 'https://oregonstudentaid.gov/oregon-opportunity-grant.aspx',
          status: 'Check Eligibility'
        });
        
        grants.push({
          name: 'Oregon Promise',
          amount: 'Up to $4,000',
          provider: 'Oregon Office of Student Access and Completion',
          description: 'Grant for recent Oregon high school graduates attending community college',
          eligibility: 'Recent Oregon high school graduate with 2.5+ GPA',
          link: 'https://oregonstudentaid.gov/oregon-promise.aspx',
          status: parseFloat(userProfile.gpa) >= 2.5 ? 'Likely Eligible' : 'Check Eligibility'
        });
      }
    } else if (state === 'California') {
      if (isCollegeStudent && !isGraduateStudent) {
        grants.push({
          name: 'Cal Grant',
          amount: 'Up to $12,570',
          provider: 'California Student Aid Commission',
          description: 'Need-based grant for California residents attending California colleges',
          eligibility: 'California resident with demonstrated financial need and academic achievement',
          link: 'https://www.csac.ca.gov/cal-grants',
          status: 'Check Eligibility'
        });
        
        grants.push({
          name: 'Middle Class Scholarship',
          amount: 'Up to 40% of tuition',
          provider: 'California Student Aid Commission',
          description: 'Scholarship for middle-income California students attending UC or CSU',
          eligibility: 'California resident with family income up to $201,000',
          link: 'https://www.csac.ca.gov/middle-class-scholarship',
          status: 'Check Eligibility'
        });
      }
    }
    else if (state === 'New York') {
      if (isCollegeStudent && !isGraduateStudent) {
        grants.push({
          name: 'Tuition Assistance Program (TAP)',
          amount: 'Up to $5,665',
          provider: 'New York State Higher Education Services Corporation',
          description: 'Need-based grant for New York residents attending eligible NY schools',
          eligibility: 'New York resident with demonstrated financial need',
          link: 'https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/grants/tap-eligibility.html',
          status: 'Check Eligibility'
        });
        
        grants.push({
          name: 'Excelsior Scholarship',
          amount: 'Full tuition coverage',
          provider: 'New York State Higher Education Services Corporation',
          description: 'Scholarship for middle-class families to attend SUNY or CUNY tuition-free',
          eligibility: 'New York resident with family income up to $125,000',
          link: 'https://www.hesc.ny.gov/pay-for-college/financial-aid/types-of-financial-aid/nys-grants-scholarships-awards/the-excelsior-scholarship.html',
          status: 'Check Eligibility'
        });
      }
    }
    else if (state === 'Texas') {
      if (isCollegeStudent && !isGraduateStudent) {
        grants.push({
          name: 'TEXAS Grant',
          amount: 'Up to $5,195',
          provider: 'Texas Higher Education Coordinating Board',
          description: 'Need-based grant for Texas residents attending eligible TX schools',
          eligibility: 'Texas resident with demonstrated financial need',
          link: 'http://www.collegeforalltexans.com/apps/financialaid/tofa2.cfm?ID=458',
          status: 'Check Eligibility'
        });
        
        grants.push({
          name: 'Texas Educational Opportunity Grant (TEOG)',
          amount: 'Up to $3,000',
          provider: 'Texas Higher Education Coordinating Board',
          description: 'Need-based grant for Texas residents attending community colleges',
          eligibility: 'Texas resident with demonstrated financial need',
          link: 'http://www.collegeforalltexans.com/apps/financialaid/tofa2.cfm?ID=529',
          status: 'Check Eligibility'
        });
      }
    }
    else if (state) {
      // Generic state grant for states without specific defined grants
      grants.push({
        name: `${state} State Grant`,
        amount: 'Varies',
        provider: `${state} Higher Education Agency`,
        description: `Need-based grant for ${state} residents`,
        eligibility: `${state} resident with demonstrated financial need`,
        link: '#',
        status: 'Check Eligibility'
      });
    }
    
    return grants;
  };

  // Get education tax benefits and savings opportunities
  const getSavingsOpportunities = () => {
    const isCollegeStudent = userProfile.education_level && 
      !userProfile.education_level.toLowerCase().includes('high school');
    
    const isGraduateStudent = userProfile.education_level && 
      (userProfile.education_level.toLowerCase().includes('graduate') || 
       userProfile.education_level.toLowerCase().includes('phd'));
    
    const opportunities: SavingsOpportunity[] = [];
    
    if (isCollegeStudent) {
      opportunities.push({
        name: 'American Opportunity Tax Credit (AOTC)',
        amount: 'Up to $2,500 per year',
        description: 'Tax credit for qualified education expenses paid for eligible students',
        eligibility: 'First 4 years of higher education',
        icon: ReceiptCent,
        link: 'https://www.irs.gov/credits-deductions/individuals/aotc'
      });
      
      if (isGraduateStudent) {
        opportunities.push({
          name: 'Lifetime Learning Credit',
          amount: 'Up to $2,000 per year',
          description: 'Tax credit for qualified tuition and education expenses',
          eligibility: 'No limit on years claimed',
          icon: BadgePercent,
          link: 'https://www.irs.gov/credits-deductions/individuals/llc'
        });
      }
      
      opportunities.push({
        name: 'Student Loan Interest Deduction',
        amount: 'Up to $2,500 per year',
        description: 'Tax deduction for interest paid on student loans',
        eligibility: 'Available for qualified student loans',
        icon: CreditCard,
        link: 'https://www.irs.gov/taxtopics/tc456'
      });
      
      opportunities.push({
        name: '529 College Savings Plan',
        amount: 'Tax-advantaged growth',
        description: 'Tax-advantaged savings plan for education expenses',
        eligibility: 'Available to save for qualified education expenses',
        icon: PiggyBank,
        link: 'https://www.sec.gov/reportspubs/investor-publications/investorpubsintro529htm.html'
      });
      
      opportunities.push({
        name: 'FAFSA Application',
        amount: 'Access to federal aid',
        description: 'Required application for federal student aid and many scholarships',
        eligibility: 'Must complete annually for aid consideration',
        icon: ClipboardCheck,
        link: 'https://studentaid.gov/h/apply-for-aid/fafsa'
      });
    }
    
    return opportunities;
  };

  // Show loading state while fetching profile
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
      </div>
    );
  }

  // Get state-specific grants
  const stateGrants = getStateGrants();
  
  // Get savings opportunities
  const savingsOpportunities = getSavingsOpportunities();
  
  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/10">
      <div className="container mx-auto px-4">
        <motion.div
          ref={dashboardRef}
          initial="hidden"
          animate={dashboardInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Profile Incomplete Alert - Show if profile isn't complete */}
          {!isProfileComplete && (
            <motion.div 
              variants={itemVariants}
              className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30 shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-400 mb-2">Complete Your Profile</h2>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Your profile is incomplete. Complete it to get personalized scholarship matches.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-md transition-colors whitespace-nowrap"
                >
                  Complete Profile
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Profile and Saved Scholarships */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Profile Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-20 relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 border-4 border-blue-500">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-12 p-6">
                  <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
                    {user?.user_metadata?.name || 'Student'}
                  </h2>
                  <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                    {user?.email}
                  </p>
                  
                  <div className="space-y-3">
                    {userProfile.education_level && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Education Level</div>
                          <div className="font-medium text-gray-900 dark:text-white">{userProfile.education_level}</div>
                        </div>
                      </div>
                    )}
                    
                    {userProfile.school && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <School className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">School</div>
                          <div className="font-medium text-gray-900 dark:text-white">{userProfile.school}</div>
                        </div>
                      </div>
                    )}
                    
                    {userProfile.major && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Major</div>
                          <div className="font-medium text-gray-900 dark:text-white">{userProfile.major}</div>
                        </div>
                      </div>
                    )}
                    
                    {userProfile.gpa && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">GPA</div>
                          <div className="font-medium text-gray-900 dark:text-white">{userProfile.gpa}</div>
                        </div>
                      </div>
                    )}
                    
                    {userProfile.location && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                          <div className="font-medium text-gray-900 dark:text-white">{userProfile.location}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/questionnaire')}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm transition-colors"
                    >
                      Edit Profile
                    </button>
                    
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Saved Scholarships */}
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-blue-500" />
                      Saved Scholarships
                    </h2>
                    
                    <button
                      onClick={() => navigate('/saved-scholarships')}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : savedScholarships.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-auto pr-1">
                      {savedScholarships.slice(0, 5).map((scholarship) => (
                        <div
                          key={scholarship.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {scholarship.name}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                              ${scholarship.amount.toLocaleString()}
                            </div>
                            
                            {scholarship.deadline && (
                              <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                                Due: {formatDate(scholarship.deadline)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end">
                            <button
                              onClick={() => navigate(`/scholarship/${scholarship.id}`)}
                              className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                              <span>Details</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {savedScholarships.length > 5 && (
                        <button
                          onClick={() => navigate('/saved-scholarships')}
                          className="w-full py-3 text-center text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          +{savedScholarships.length - 5} more saved scholarships
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Bookmark className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved scholarships</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't saved any scholarships yet</p>
                      <button
                        onClick={() => navigate('/questionnaire')}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors inline-flex items-center gap-2"
                      >
                        <span>Find Scholarships</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Right Column - Grants and Savings Opportunities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grants Section */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-green-500" />
                    Grants
                  </h2>
                  {stateGrants.length > 0 ? (
                    <div className="space-y-4">
                      {stateGrants.map((grant, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{grant.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{grant.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{grant.amount}</span>
                            <a href={grant.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                              Details
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">No grants available at this time.</p>
                  )}
                </div>
              </motion.div>
              
              {/* Savings Opportunities Section */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Savings Opportunities
                  </h2>
                  {savingsOpportunities.length > 0 ? (
                    <div className="space-y-4">
                      {savingsOpportunities.map((opportunity, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{opportunity.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{opportunity.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{opportunity.amount}</span>
                            <a href={opportunity.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                              Learn More
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">No savings opportunities available at this time.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}