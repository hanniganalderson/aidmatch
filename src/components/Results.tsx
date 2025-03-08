import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, GraduationCap, Clock, ArrowRight, Bookmark, Trophy, 
  Users, Filter, Search, X, ChevronDown, MapPin, DollarSign,
  Sparkles, Zap, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScholarshipMatching } from '../hooks/useScholarshipMatching';
import { useInView } from 'react-intersection-observer';
import { supabase } from '../lib/supabase';
import type { ScoredScholarship, UserAnswers } from '../types';
import { useNavigate } from 'react-router-dom';

interface ResultsProps {
  answers: UserAnswers;
}

export function Results({ answers }: ResultsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minAmount: 0,
    maxAmount: 100000,
    competition: [] as string[],
    showSavedOnly: false,
    sortBy: 'match'
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [savingScholarship, setSavingScholarship] = useState<Record<string, boolean>>({});

  const { matchResult, loading, error, getExplanation } = useScholarshipMatching(answers);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Fetch saved scholarships on component mount
  useEffect(() => {
    if (user) {
      fetchSavedScholarships();
    }
  }, [user]);

  // Filter scholarships
  const filteredScholarships = React.useMemo(() => {
    if (!matchResult?.scholarships) return [];
    
    let results = [...matchResult.scholarships];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.provider.toLowerCase().includes(term)
      );
    }
    
    // Apply amount filter
    results = results.filter(s => 
      s.amount >= filters.minAmount && s.amount <= filters.maxAmount
    );
    
    // Apply competition filter
    if (filters.competition.length > 0) {
      results = results.filter(s => 
        filters.competition.includes(s.competition_level)
      );
    }
    
    // Apply saved filter
    if (filters.showSavedOnly) {
      results = results.filter(s => savedScholarships.includes(s.id));
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'amount':
        results.sort((a, b) => b.amount - a.amount);
        break;
      case 'deadline':
        results.sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
        break;
      default:
        results.sort((a, b) => b.score - a.score);
    }
    
    return results;
  }, [matchResult, searchTerm, filters, savedScholarships]);

  // Fetch saved scholarships
  const fetchSavedScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      if (data) {
        const savedIds = data.map(item => item.scholarship_id);
        setSavedScholarships(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved scholarships:', error);
    }
  };

  // Save a scholarship
  const handleSaveScholarship = async (scholarship: ScoredScholarship) => {
    if (!user) {
      // Redirect to sign in or show a message
      alert('Please sign in to save scholarships');
      return;
    }

    try {
      setSavingScholarship(prev => ({ ...prev, [scholarship.id]: true }));
      
      if (savedScholarships.includes(scholarship.id)) {
        // Unsave the scholarship
        const { error } = await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_id', scholarship.id);

        if (error) throw error;
        
        setSavedScholarships(prev => prev.filter(id => id !== scholarship.id));
        // Show toast notification
        showToast("Scholarship removed from saved", "info");
      } else {
        // Save the scholarship
        const { error } = await supabase
          .from('saved_scholarships')
          .insert({
            user_id: user.id,
            scholarship_id: scholarship.id,
            saved_at: new Date().toISOString()
          });

        if (error) throw error;
        
        setSavedScholarships(prev => [...prev, scholarship.id]);
        // Show toast notification
        showToast("Scholarship saved successfully", "success");
      }
    } catch (error) {
      console.error('Error saving scholarship:', error);
      // Show error toast
      showToast("Error saving scholarship", "error");
    } finally {
      setSavingScholarship(prev => ({ ...prev, [scholarship.id]: false }));
    }
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const toast = document.createElement('div');
    let icon = '';
    let bgColor = '';
    
    switch (type) {
      case 'success':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
        bgColor = 'bg-white dark:bg-gray-800';
        break;
      case 'error':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`;
        bgColor = 'bg-red-50 dark:bg-red-900/30';
        break;
      case 'info':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1-5a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" /></svg>`;
        bgColor = 'bg-white dark:bg-gray-800';
        break;
    }
    
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  };

  // Get explanation for a scholarship
  const handleGetExplanation = async (scholarship: ScoredScholarship) => {
    if (scholarship.explanation) {
      setExpandedScholarshipId(expandedScholarshipId === scholarship.id ? null : scholarship.id);
      return;
    }
    
    try {
      setExplanationLoading(prev => ({ ...prev, [scholarship.id]: true }));
      await getExplanation(scholarship);
      setExpandedScholarshipId(scholarship.id);
    } catch (error) {
      console.error('Error getting explanation:', error);
    } finally {
      setExplanationLoading(prev => ({ ...prev, [scholarship.id]: false }));
    }
  };

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

  // Calculate days remaining
  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Set both dates to midnight for accurate day calculation
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Render scholarship card
  const renderScholarshipCard = (scholarship: ScoredScholarship, index: number) => {
    const daysRemaining = getDaysRemaining(scholarship.deadline);
    
    return (
      <motion.div
        key={scholarship.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative bg-white/5 dark:bg-surface-100/10 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-surface-50/20 p-6 hover:border-primary-500/30 transition-all duration-300 shadow-lg">
          {scholarship.score >= 90 && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-glow">
              <Trophy className="w-4 h-4" />
              <span>Perfect Match</span>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {scholarship.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {scholarship.provider}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {scholarship.requirements || 'No specific requirements listed'}
              </p>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-sm text-primary-500">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>${scholarship.amount.toLocaleString()}</span>
                </div>
                
                {scholarship.deadline && (
                  <div className={`flex items-center text-sm ${
                    daysRemaining !== null && daysRemaining <= 14 
                      ? 'text-red-500' 
                      : 'text-accent-500'
                  }`}>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDate(scholarship.deadline)}</span>
                    {daysRemaining !== null && daysRemaining <= 14 && (
                      <span className="ml-1 font-medium">
                        ({daysRemaining} days left)
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-emerald-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="capitalize">
                    {scholarship.competition_level} Competition
                  </span>
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
                {scholarship.is_recurring && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
                    Recurring {scholarship.recurring_period || ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-bold text-primary-500">
                {scholarship.score}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Match Score</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSaveScholarship(scholarship)}
                className={`mt-2 px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${savedScholarships.includes(scholarship.id) 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'}`}
                disabled={savingScholarship[scholarship.id]}
                aria-label={savedScholarships.includes(scholarship.id) ? "Unsave scholarship" : "Save scholarship"}
              >
                {savingScholarship[scholarship.id] ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Bookmark 
                    className={`w-5 h-5 ${savedScholarships.includes(scholarship.id) ? 'fill-white' : ''}`} 
                  />
                )}
                <span className="text-sm font-medium">
                  {savedScholarships.includes(scholarship.id) ? "Saved" : "Save"}
                </span>
              </motion.button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => handleGetExplanation(scholarship)}
              className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              {explanationLoading[scholarship.id] ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Why This Match?
                </>
              )}
            </button>

            <a
              href={scholarship.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <AnimatePresence>
            {expandedScholarshipId === scholarship.id && scholarship.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-primary-500/5 dark:bg-surface-50/10 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis:</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {scholarship.explanation}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4" />
            <span>Your Financial Aid Matches</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Your Perfect Financial Aid Opportunities
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your profile, we've found {matchResult?.totalMatches || 0} opportunities 
            that match your qualifications. Let's find your perfect financial aid path.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Finding your best financial aid matches...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search scholarships..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500/50 transition-colors"
                  />
                </div>
                
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20 text-gray-900 dark:text-white hover:border-primary-500/50 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <AnimatePresence>
                {filtersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-6 bg-white dark:bg-surface-100/10 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-surface-50/20"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Amount Range */}
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Award Amount</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>${filters.minAmount.toLocaleString()}</span>
                            <span>${filters.maxAmount.toLocaleString()}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100000"
                            step="1000"
                            value={filters.maxAmount}
                            onChange={(e) => setFilters({...filters, maxAmount: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-200 dark:bg-surface-50/10 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Competition Level */}
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Competition Level</h3>
                        <div className="space-y-2">
                          {['Low', 'Medium', 'High'].map((level) => (
                            <label key={level} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.competition.includes(level as 'Low' | 'Medium' | 'High')}
                                onChange={() => {
                                  const newCompetition = filters.competition.includes(level as 'Low' | 'Medium' | 'High')
                                    ? filters.competition.filter(l => l !== level)
                                    : [...filters.competition, level as 'Low' | 'Medium' | 'High'];
                                  setFilters({...filters, competition: newCompetition});
                                }}
                                className="rounded border-surface-50 text-primary-500 focus:ring-primary-500"
                              />
                              <span className="text-gray-600 dark:text-gray-400">{level} Competition</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Sort Options */}
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium mb-3">Sort By</h3>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                          className="w-full p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-surface-50/20 rounded-lg text-gray-900 dark:text-white"
                        >
                          <option value="match">Match Score</option>
                          <option value="amount">Award Amount</option>
                          <option value="deadline">Deadline</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {filteredScholarships.length > 0 ? (
                filteredScholarships.map((scholarship, index) => 
                  renderScholarshipCard(scholarship, index)
                )
              ) : (
                <div className="text-center py-12 bg-white/30 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/20">
                  <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No matches found</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {searchTerm 
                      ? "Try adjusting your search terms or filters to see more results." 
                      : "We couldn't find any financial aid matches with your current filters."}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        minAmount: 0,
                        maxAmount: 100000,
                        competition: [],
                        showSavedOnly: false,
                        sortBy: 'match'
                      });
                    }}
                    className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Pagination if needed */}
            {filteredScholarships.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300">
                    Previous
                  </button>
                  <div className="px-4 py-2 rounded-lg bg-primary-500 text-white">1</div>
                  <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}