import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Bookmark as BookmarkIcon, Search, ArrowRight, CheckCircle, BookOpen, GraduationCap, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getScholarshipExplanation } from '../lib/openai';
import type { Scholarship } from '../types';

export function Results() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlternativeResults, setIsAlternativeResults] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<Record<string, boolean>>({});
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const answers = location.state?.answers;

  useEffect(() => {
    if (!answers) {
      navigate('/questionnaire');
      return;
    }

    // Load saved scholarships
    const loadSavedScholarships = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user.id);
      if (data) {
        setSavedScholarships(data.map(item => item.scholarship_id));
      }
    };

    loadSavedScholarships();
  }, [answers, navigate, user]);

  const getExplanation = async (scholarship: Scholarship) => {
    if (explanations[scholarship.id]) return;
    
    setLoadingExplanation(prev => ({ ...prev, [scholarship.id]: true }));
    try {
      const explanation = await getScholarshipExplanation(scholarship, answers);
      setExplanations(prev => ({ ...prev, [scholarship.id]: explanation }));
    } catch (error) {
      console.error('Error getting explanation:', error);
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [scholarship.id]: false }));
    }
  };

  useEffect(() => {
    if (!answers) {
      navigate('/questionnaire');
      return;
    }

    async function fetchScholarships() {
      try {
        const gpaValue = answers.gpa === 'Below 2.0' ? 1.9 : parseFloat(answers.gpa);

        let { data: exactMatches, error: exactError } = await supabase
          .from('scholarships')
          .select('*')
          .or(`gpa_requirement.is.null,gpa_requirement.lte.${gpaValue}`)
          .or(`education_level.is.null,education_level.eq.${answers.education_level}`)
          .or(`major.is.null,major.eq.${answers.major}`)
          .order('amount', { ascending: false });

        if (exactError) throw exactError;

        if (!exactMatches?.length) {
          setIsAlternativeResults(true);
          const { data: alternativeMatches, error: altError } = await supabase
            .from('scholarships')
            .select('*')
            .or('national.eq.true,major.is.null')
            .order('roi_score', { ascending: false })
            .limit(10);

          if (altError) throw altError;
          setScholarships(alternativeMatches || []);
        } else {
          setScholarships(exactMatches);
        }
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchScholarships();
  }, [answers, navigate]);

  const handleSaveScholarship = async (scholarship: Scholarship) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (savedScholarships.includes(scholarship.id)) {
        // Remove from saved
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarship.id);
        setSavedScholarships(prev => prev.filter(id => id !== scholarship.id));
      } else {
        // Add to saved
        await supabase
          .from('saved_scholarships')
          .upsert({
            user_id: user.id,
            scholarship_id: scholarship.id
          });
        setSavedScholarships(prev => [...prev, scholarship.id]);
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
    }
  };

  const handleShowAlternativeResults = async () => {
    setLoading(true);
    try {
      const { data: alternativeMatches, error } = await supabase
        .from('scholarships')
        .select('*')
        .or('national.eq.true,major.is.null')
        .order('amount', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScholarships(alternativeMatches || []);
      setIsAlternativeResults(true);
    } catch (error) {
      console.error('Error fetching alternative scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!answers) {
    navigate('/questionnaire');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="animate-pulse space-y-8">
            <div className="text-center mb-12">
              <div className="h-10 bg-[#1A1A1A] rounded-full w-48 mx-auto mb-6" />
              <div className="h-12 bg-[#1A1A1A] rounded-xl w-3/4 mx-auto mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
                    <div className="h-4 bg-[#222222] rounded w-3/4 mb-2" />
                    <div className="h-6 bg-[#222222] rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1A1A1A] rounded-xl p-8 border border-[#333333]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-4 w-full">
                    <div className="h-8 bg-[#222222] rounded w-3/4" />
                    <div className="h-4 bg-[#222222] rounded w-1/2" />
                  </div>
                  <div className="h-10 w-10 bg-[#222222] rounded-full flex-shrink-0" />
                </div>
                <div className="h-20 bg-[#222222] rounded w-full mb-6" />
                <div className="h-40 bg-[#222222] rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full mb-6">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Results</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isAlternativeResults ? 'Alternative Scholarship Matches' : 'Your Matched Scholarships'}
          </h1>

          <div className="flex items-center justify-center space-x-6 text-gray-300 mb-8">
            <div className="flex items-center px-4 py-2 bg-[#1A1A1A] rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>{answers?.major}</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-[#1A1A1A] rounded-lg">
              <GraduationCap className="w-4 h-4 mr-2" />
              <span>GPA: {answers?.gpa}</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-[#1A1A1A] rounded-lg">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{answers?.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12 text-center">
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <p className="text-[#888888] text-sm mb-2">Education Level</p>
              <p className="text-white font-medium">{answers.education_level}</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <p className="text-[#888888] text-sm mb-2">School</p>
              <p className="text-white font-medium">{answers.school}</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <p className="text-[#888888] text-sm mb-2">Major</p>
              <p className="text-white font-medium">{answers.major}</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]">
              <p className="text-[#888888] text-sm mb-2">GPA</p>
              <p className="text-white font-medium">{answers.gpa}</p>
            </div>
          </div>
        </motion.div>

        {scholarships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-[#1A1A1A] rounded-xl border border-[#333333] max-w-2xl mx-auto mt-8"
          >
            <div className="p-8">
              <div className="w-16 h-16 mx-auto mb-6 text-[#666666]">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">No matches found</h3>
              <p className="text-[#888888] mb-6">
                {isAlternativeResults
                  ? 'Try adjusting your filters for more results.'
                  : 'We couldn\'t find exact matches for your criteria.'}
              </p>
              {!isAlternativeResults && (
                <button
                  onClick={handleShowAlternativeResults}
                  className="btn-primary"
                >
                  Show Similar Scholarships
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mt-8">
            {scholarships.map((scholarship) => (
              <motion.div
                key={scholarship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1A1A1A] rounded-xl p-8 border border-[#333333] hover:border-[#5865F2] transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{scholarship.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-[#5865F2] font-medium">${scholarship.amount.toLocaleString()}</span>
                      <span className="text-[#888888]">•</span>
                      <div className="flex items-center text-[#888888]">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Due {new Date(scholarship.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveScholarship(scholarship)}
                    className={`p-2 rounded-full transition-colors ${savedScholarships.includes(scholarship.id) ? 'bg-[#5865F2]/20 text-[#5865F2]' : 'bg-[#222222] text-[#666666] hover:bg-[#5865F2]/10 hover:text-[#5865F2]'}`}
                  >
                    <BookmarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-[#AAAAAA]">{scholarship.description}</p>
                </div>

                <div className="space-y-4">
                  {explanations[scholarship.id] ? (
                    <div className="bg-[#222222] rounded-lg p-6">
                      <div className="flex items-center space-x-2 text-[#5865F2] mb-4">
                        <Brain className="w-5 h-5" />
                        <span className="font-medium">AI Analysis</span>
                      </div>
                      <p className="text-[#AAAAAA]">{explanations[scholarship.id]}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => getExplanation(scholarship)}
                      disabled={loadingExplanation[scholarship.id]}
                      className="w-full py-3 px-4 rounded-lg bg-[#222222] text-[#888888] hover:bg-[#2A2A2A] hover:text-white transition-colors flex items-center justify-center space-x-2"
                    >
                      {loadingExplanation[scholarship.id] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-[#5865F2]"></div>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Get AI Analysis</span>
                        </>
                      )}
                    </button>
                  )}

                  {scholarship.eligibility && scholarship.eligibility.length > 0 && (
                    <div className="bg-[#222222] rounded-lg p-6">
                      <div className="flex items-center space-x-2 text-[#5865F2] mb-4">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Requirements</span>
                      </div>
                      <ul className="text-[#AAAAAA] list-disc list-inside space-y-2">
                        {scholarship.eligibility.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => window.open(scholarship.applicationUrl, '_blank')}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}