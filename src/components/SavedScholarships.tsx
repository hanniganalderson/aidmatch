import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, ArrowRight, Bookmark, Trophy, Users, Search, X, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  requirements: string;
  difficulty_score: number;
  competition_level: 'low' | 'medium' | 'high';
  roi_score: number;
  is_local: boolean;
  link: string | null;
  gpa_requirement: string;
  major: string;
  national: boolean;
  major_search: string;
  education_level: string[];
  is_recurring: boolean;
  recurring_period: string | null;
  score?: number;
}

export function SavedScholarships() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchSavedScholarships = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // First get the saved scholarship IDs
        const { data: savedData, error: savedError } = await supabase
          .from('saved_scholarships')
          .select('scholarship_id')
          .eq('user_id', user.id);

        if (savedError) throw savedError;
        if (!savedData || savedData.length === 0) {
          setScholarships([]);
          setIsLoading(false);
          return;
        }

        const scholarshipIds = savedData.map(item => item.scholarship_id);

        // Then fetch the actual scholarship data
        const { data: scholarshipsData, error: scholarshipsError } = await supabase
          .from('scholarships')
          .select('*')
          .in('id', scholarshipIds);

        if (scholarshipsError) throw scholarshipsError;
        
        setScholarships(scholarshipsData || []);
      } catch (error) {
        console.error('Error fetching saved scholarships:', error);
        setError('Failed to load your saved scholarships. Please try again later.');
        
        // For demo purposes, use mock data if there's an error
        setScholarships([
          {
            id: '1',
            name: 'Future Tech Leaders Scholarship',
            provider: 'Innovation Foundation',
            amount: 25000,
            deadline: '2025-05-01',
            requirements: 'Supporting next-generation technology innovators with a focus on AI and machine learning.',
            difficulty_score: 3,
            competition_level: 'medium',
            roi_score: 85,
            is_local: false,
            link: 'https://example.com/apply',
            gpa_requirement: '3.5',
            major: 'Computer Science',
            national: true,
            major_search: 'computer science,technology,engineering',
            education_level: ['College Junior', 'College Senior'],
            is_recurring: false,
            recurring_period: null
          },
          {
            id: '3',
            name: 'STEM Diversity Scholarship',
            provider: 'Tech for All Foundation',
            amount: 20000,
            deadline: '2025-04-30',
            requirements: 'Promoting diversity in STEM fields with a focus on underrepresented groups.',
            difficulty_score: 2,
            competition_level: 'low',
            roi_score: 90,
            is_local: false,
            link: 'https://example.com/apply',
            gpa_requirement: '3.0',
            major: 'STEM',
            national: true,
            major_search: 'stem,science,technology,engineering,mathematics',
            education_level: ['College Freshman', 'College Sophomore', 'College Junior', 'College Senior'],
            is_recurring: true,
            recurring_period: 'yearly'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedScholarships();
  }, [user, navigate]);

  const handleUnsave = async (scholarshipId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('saved_scholarships')
        .delete()
        .eq('user_id', user.id)
        .eq('scholarship_id', scholarshipId);
      
      setScholarships(prev => prev.filter(s => s.id !== scholarshipId));
    } catch (error) {
      console.error('Error removing scholarship:', error);
    }
  };

  const filteredScholarships = scholarships.filter(scholarship => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      scholarship.name.toLowerCase().includes(term) ||
      scholarship.provider.toLowerCase().includes(term) ||
      (scholarship.major && scholarship.major.toLowerCase().includes(term))
    );
  });

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen py-24 bg-white dark:bg-transparent">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full mb-6">
            <Bookmark className="w-4 h-4" />
            <span>Saved Scholarships</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Saved Scholarships
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage and track scholarships you've saved for later
          </p>
        </motion.div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your saved scholarships...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your saved scholarships..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500/50 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {scholarships.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20 shadow-lg">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Saved Scholarships</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't saved any scholarships yet.</p>
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  Find Scholarships
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20 shadow-lg">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Matching Results</h3>
                <p className="text-gray-600 dark:text-gray-400">No scholarships match your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredScholarships.map((scholarship) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative bg-white/5 dark:bg-surface-100/10 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-surface-50/20 p-6 hover:border-primary-500/30 transition-all duration-300 shadow-lg">
                      {scholarship.score && scholarship.score >= 90 && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-glow">
                          <Trophy className="w-4 h-4" />
                          <span>Perfect Match</span>
                        </div>
                      )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {scholarship.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{scholarship.requirements}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-sm text-primary-500">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>${scholarship.amount.toLocaleString()}</span>
                          </div>
                          {scholarship.deadline && (
                            <div className="flex items-center text-sm text-accent-500">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{formatDate(scholarship.deadline)}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-emerald-500">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="capitalize">{scholarship.competition_level} Competition</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {scholarship.major && (
                            <span className="text-xs bg-primary-500/10 text-primary-500 px-2 py-1 rounded-full">
                              {scholarship.major}
                            </span>
                          )}
                          {scholarship.education_level?.map((level, i) => (
                            <span key={i} className="text-xs bg-accent-500/10 text-accent-500 px-2 py-1 rounded-full">
                              {level}
                            </span>
                          ))}
                          {scholarship.gpa_requirement && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
                              GPA: {scholarship.gpa_requirement}+
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsave(scholarship.id)}
                        className="text-primary-500 hover:text-red-500 transition-colors"
                      >
                        <Bookmark className="w-6 h-6 fill-current" />
                      </button>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <button
                        onClick={() => handleUnsave(scholarship.id)}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                      
                      <a
                        href={scholarship.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <span>{scholarship.link ? 'Apply Now' : 'Coming Soon'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}