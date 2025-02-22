import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Bookmark as BookmarkIcon, GraduationCap, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getScholarshipExplanation } from '../lib/openai';
import { useScholarships } from '../hooks/useScholarships';
import { useScholarshipSave } from '../hooks/useScholarshipSave';
import { trackEvent } from '../lib/analytics';
import type { Scholarship, UserAnswers } from '../types';

interface ScholarshipWithLocation extends Scholarship {
  location?: string;
}

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onClick: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ loading, hasMore, onClick }) => {
  if (!hasMore) return null;
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      className="group relative w-full py-4 px-6 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] disabled:opacity-50 transition-all duration-200 hover:scale-[1.02]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.div
              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            Loading More Scholarships...
          </>
        ) : (
          <>
            Load More Scholarships
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: 3 }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                repeatType: 'reverse' 
              }}
            >
              →
            </motion.span>
          </>
        )}
      </span>
      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </motion.button>
  );
};

export function Results() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers as UserAnswers | undefined;

  // Redirect if no answers
  if (!answers) {
    navigate('/questionnaire');
    return null;
  }

  const [isAlternativeResults, setIsAlternativeResults] = useState(false);
  const [showingAlternatives, setShowingAlternatives] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<Record<string, boolean>>({});

  const {
    scholarships,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    setError,
    setPage
  } = useScholarships({ answers, isAlternativeResults });

  const {
    savedScholarshipIds,
    saving,
    loadSavedScholarships,
    toggleSave
  } = useScholarshipSave({
    userId: user?.id,
    onError: (err) => setError(err)
  });

  // Load scholarships and saved scholarships on mount
  useEffect(() => {
    const loadInitialScholarships = async () => {
      try {
        // First try to load exact matches
        setIsAlternativeResults(false);
        await loadMore();

        // If no exact matches, try alternative results
        if (scholarships.length === 0) {
          setShowingAlternatives(true);
          setIsAlternativeResults(true);
          setError(null);
          setPage(1); // Reset page counter
          await loadMore();
        }
      } catch (err) {
        console.error('Error loading scholarships:', err);
        // On error, try alternative results
        setShowingAlternatives(true);
        setIsAlternativeResults(true);
        setError(null);
        setPage(1); // Reset page counter
        await loadMore();
      }
    };
    loadInitialScholarships();
  }, []);

  // Reset state when answers change
  useEffect(() => {
    setShowingAlternatives(false);
    setIsAlternativeResults(false);
    setError(null);
    setPage(1); // Reset page counter
  }, [answers]);

  useEffect(() => {
    loadSavedScholarships();
  }, [loadSavedScholarships]);

  const handleSaveScholarship = useCallback(async (scholarship: Scholarship) => {
    if (!user) {
      navigate('/signup', { state: { from: location.pathname } });
      return;
    }

    const success = await toggleSave(scholarship);
    if (success) {
      trackEvent('scholarship_save_toggle', {
        scholarshipId: scholarship.id,
        action: savedScholarshipIds.includes(scholarship.id) ? 'unsave' : 'save'
      });
    }
  }, [user, navigate, location.pathname, savedScholarshipIds, toggleSave]);

  const getExplanation = useCallback(async (scholarship: Scholarship) => {
    if (!answers || explanations[scholarship.id]) return;
    
    setLoadingExplanation(prev => ({ ...prev, [scholarship.id]: true }));
    try {
      const explanation = await getScholarshipExplanation(scholarship, answers);
      setExplanations(prev => ({ ...prev, [scholarship.id]: explanation }));
      
      trackEvent('scholarship_explanation_view', {
        scholarshipId: scholarship.id
      });
    } catch (err) {
      console.error('Error getting explanation:', err);
      setError('Failed to get explanation. Please try again.');
    } finally {
      setLoadingExplanation(prev => ({ ...prev, [scholarship.id]: false }));
    }
  }, [answers, explanations, setError]);

  const handleShowAlternativeResults = useCallback(() => {
    setIsAlternativeResults(true);
    trackEvent('show_alternative_results');
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border-2 border-red-500/20 rounded-xl p-8 text-center"
          >
            <div className="text-red-500 text-xl font-medium mb-4">{error}</div>
            <button
              onClick={() => {
                setError(null);
                loadMore();
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center space-x-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded-full mb-6">
                <GraduationCap className="w-4 h-4" />
                <span>AI-Powered Results</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Your Matched Scholarships
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {showingAlternatives ? (
                  'We couldn\'t find exact matches for your criteria, but here are some alternative scholarships that might interest you. These have slightly different requirements but could still be worth exploring.'
                ) : (
                  'We\'ve analyzed your profile and found scholarships that match your qualifications. Our AI scoring system ranks scholarships based on your likelihood of winning.'
                )}
              </p>
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  className="w-12 h-12 border-4 border-[#5865F2] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="mt-4 text-gray-400">Finding your perfect scholarships...</p>
              </div>
            ) : scholarships.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <p className="text-xl text-gray-400 mb-6">
                  No scholarships found matching your criteria.
                </p>
                <button
                  onClick={handleShowAlternativeResults}
                  className="px-6 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
                >
                  Show Alternative Results
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {scholarships.map((scholarship: ScholarshipWithLocation & { score: number }) => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {scholarship.name}
                        </h3>
                        <p className="text-gray-400 mb-4">{scholarship.description}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center text-sm text-gray-400">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            {scholarship.amount}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-1" />
                            {scholarship.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            {scholarship.deadline}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveScholarship(scholarship)}
                        disabled={saving}
                        className="text-gray-400 hover:text-[#5865F2] transition-colors disabled:opacity-50"
                      >
                        <BookmarkIcon
                          className={`w-6 h-6 ${savedScholarshipIds.includes(scholarship.id) ? 'fill-[#5865F2] text-[#5865F2]' : ''}`}
                        />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-[#5865F2] font-medium">
                          {Math.round(scholarship.score * 100)}% Match
                        </div>
                        <button
                          onClick={() => getExplanation(scholarship)}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {loadingExplanation[scholarship.id] ? (
                            <motion.div
                              className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                          ) : (
                            'Why?'
                          )}
                        </button>
                      </div>
                      <a
                        href={scholarship.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors"
                        onClick={() => trackEvent('scholarship_apply_click', { scholarshipId: scholarship.id })}
                      >
                        Apply Now
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
                            <div className="font-medium text-white mb-1">Why this matches your profile:</div>
                            {explanations[scholarship.id]}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                <LoadMoreButton
                  loading={loadingMore}
                  hasMore={hasMore}
                  onClick={loadMore}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
