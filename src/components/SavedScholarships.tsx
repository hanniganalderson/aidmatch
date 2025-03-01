import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, ArrowRight, Bookmark, Trophy, Users, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-6">
            <Bookmark className="w-4 h-4" />
            <span>Saved Scholarships</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Saved Scholarships
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage and track scholarships you've saved for later
          </p>
        </motion.div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
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
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="text-center py-12 bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A]">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Saved Scholarships</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't saved any scholarships yet.</p>
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  Find Scholarships
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A]">
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
                    className="bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-[#2A2D3A] relative hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {scholarship.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{scholarship.requirements}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            <span>${scholarship.amount.toLocaleString()}</span>
                          </div>
                          {scholarship.deadline && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{new Date(scholarship.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="capitalize">{scholarship.competition_level} Competition</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {scholarship.major && (
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                              {scholarship.major}
                            </span>
                          )}
                          {scholarship.education_level?.map((level, i) => (
                            <span key={i} className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded">
                              {level}
                            </span>
                          ))}
                          {scholarship.gpa_requirement && (
                            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                              GPA: {scholarship.gpa_requirement}+
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsave(scholarship.id)}
                        className="text-blue-500 hover:text-red-500 transition-colors"
                      >
                        <Bookmark className="w-6 h-6 fill-current" />
                      </button>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <a
                        href={scholarship.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          scholarship.link 
                            ? 'bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <span>{scholarship.link ? 'Apply Now' : 'Coming Soon'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
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