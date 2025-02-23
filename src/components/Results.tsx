import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, GraduationCap, Clock, ArrowRight, Bookmark, Trophy, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getScholarshipExplanation } from '../lib/openai';

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

interface UserAnswers {
  major?: string;
  education_level?: string;
  gpa?: string;
}

export function Results({ 
  answers, 
  navigate 
}: { 
  answers: UserAnswers; 
  navigate: (path: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    const getScholarships = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .order('roi_score', { ascending: false });

        if (error) throw error;

        if (!data) {
          setError('No scholarships found');
          return;
        }

        const processedScholarships = data
          .map(scholarship => ({
            ...scholarship,
            score: calculateMatchScore(scholarship, answers)
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));

        setScholarships(processedScholarships);
      } catch (error) {
        console.error('Error fetching scholarships:', error);
        setError('Failed to fetch scholarships. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getScholarships();
  }, [answers]);

  useEffect(() => {
    const getSavedScholarships = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('saved_scholarships')
          .select('scholarship_id')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data) setSavedIds(data.map(item => item.scholarship_id));
      } catch (error) {
        console.error('Error fetching saved scholarships:', error);
      }
    };

    getSavedScholarships();
  }, [user?.id]);

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase environment variables');
        }

        const { data, error: countError } = await supabase
          .from('scholarships')
          .select('count');

        if (countError) throw countError;

        console.log('Connection successful! Row count:', data);

        const { data: sampleData, error: sampleError } = await supabase
          .from('scholarships')
          .select('*')
          .limit(1);

        if (sampleError) throw sampleError;

        console.log('Sample data:', sampleData);
      } catch (err) {
        console.error('Connection test failed:', err);
        setError(err instanceof Error ? err.message : 'Database connection failed');
      }
    };

    testConnection();
  }, []);

  const handleSave = async (scholarship: Scholarship) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    try {
      if (savedIds.includes(scholarship.id)) {
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarship.id);
        setSavedIds(prev => prev.filter(id => id !== scholarship.id));
      } else {
        await supabase
          .from('saved_scholarships')
          .insert({ user_id: user.id, scholarship_id: scholarship.id });
        setSavedIds(prev => [...prev, scholarship.id]);
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
    }
  };

  const getExplanation = async (scholarship: Scholarship) => {
    if (explanations[scholarship.id]) return;

    try {
      const explanation = await getScholarshipExplanation(scholarship, answers);
      setExplanations(prev => ({ ...prev, [scholarship.id]: explanation }));
    } catch (error) {
      console.error('Error getting explanation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {isLoading && (
          <div className="text-center text-white">
            <p>Loading scholarships...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && scholarships.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>No Results</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">No Scholarships Found</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any scholarships matching your criteria. Try adjusting your search parameters or check back later for new opportunities.
            </p>
          </motion.div>
        )}

        {!isLoading && !error && scholarships.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full mb-6">
                <GraduationCap className="w-4 h-4" />
                <span>Scholarship Matches</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Available Scholarships
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Found {scholarships.length} scholarships matching your profile
              </p>
            </motion.div>

            <div className="space-y-6">
              {scholarships.map(scholarship => (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] relative"
                >
                  {scholarship.score && scholarship.score >= 0.8 && (
                    <div className="absolute top-0 right-0 bg-[#5865F2] text-white px-3 py-1 rounded-bl-lg text-sm font-medium flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>Top Match</span>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {scholarship.name}
                      </h3>
                      <p className="text-gray-400 mb-4">{scholarship.requirements}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          <span>${scholarship.amount.toLocaleString()}</span>
                        </div>
                        {scholarship.deadline && (
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{new Date(scholarship.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{scholarship.competition_level} Competition</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {scholarship.major && (
                          <span className="text-sm bg-[#5865F2]/10 text-[#5865F2] px-2 py-1 rounded">
                            {scholarship.major}
                          </span>
                        )}
                        {scholarship.education_level?.map((level, i) => (
                          <span key={i} className="text-sm bg-[#9B6DFF]/10 text-[#9B6DFF] px-2 py-1 rounded">
                            {level}
                          </span>
                        ))}
                        {scholarship.gpa_requirement && (
                          <span className="text-sm bg-[#43B581]/10 text-[#43B581] px-2 py-1 rounded">
                            GPA: {scholarship.gpa_requirement}+
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave(scholarship)}
                      className="text-gray-400 hover:text-[#5865F2] transition-colors"
                    >
                      <Bookmark
                        className={`w-6 h-6 ${savedIds.includes(scholarship.id) ? 'fill-[#5865F2] text-[#5865F2]' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-[#5865F2] font-medium">
                        {scholarship.score ? `${Math.round(scholarship.score * 100)}% Match` : 'No Match Score'}
                      </div>
                      <button
                        onClick={() => getExplanation(scholarship)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Why?
                      </button>
                    </div>

                    <a
                      href={scholarship.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        scholarship.link ? 'bg-[#5865F2] text-white hover:bg-[#4752C4]' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span>{scholarship.link ? 'Apply Now' : 'Coming Soon'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  {explanations[scholarship.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-[#222222] rounded-lg text-gray-400 text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <Brain className="w-5 h-5 text-[#5865F2] mt-0.5" />
                        <div>
                          <div className="font-medium text-white mb-1">Match Details:</div>
                          <div>{explanations[scholarship.id]}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
            </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function calculateMatchScore(scholarship: Scholarship, answers: UserAnswers): number {
  let score = 0;
  let totalFactors = 0;

  if (scholarship.major && answers.major) {
    totalFactors++;
    const scholarshipMajors = scholarship.major.toLowerCase().split(',').map(m => m.trim());
    const userMajor = answers.major.toLowerCase().trim();
    
    if (scholarshipMajors.includes(userMajor)) {
      score++;
    } else if (scholarshipMajors.some(m => m.includes(userMajor) || userMajor.includes(m))) {
      score += 0.7;
    }
  }

  if (scholarship.education_level?.length && answers.education_level) {
    totalFactors++;
    const userLevel = answers.education_level.toLowerCase().trim();
    if (scholarship.education_level.some(level => level.toLowerCase().trim() === userLevel)) {
      score++;
    }
  }

  if (scholarship.gpa_requirement && answers.gpa) {
    totalFactors++;
    const requiredGpa = parseFloat(scholarship.gpa_requirement);
    const userGpa = parseFloat(answers.gpa);
    
    if (!isNaN(requiredGpa) && !isNaN(userGpa) && userGpa >= requiredGpa) {
      score++;
      if (userGpa >= requiredGpa + 0.5) {
        score += 0.2;
      }
    }
  }

  const baseScore = totalFactors > 0 ? score / totalFactors : 0;
  const roiWeight = scholarship.roi_score / 100;
  const competitionMultiplier = getCompetitionMultiplier(scholarship.competition_level);

  return baseScore * (1 + roiWeight) * competitionMultiplier;
}

function getCompetitionMultiplier(level: string): number {
  switch (level.toLowerCase()) {
    case 'low': return 1.2;
    case 'medium': return 1.0;
    case 'high': return 0.8;
    default: return 1.0;
  }
}