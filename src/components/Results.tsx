import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, GraduationCap, Clock, ArrowRight, Bookmark, Trophy, 
  Users, Filter, Search, X, ChevronDown, MapPin, DollarSign 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScholarshipMatching, useSavedScholarships } from '../hooks/useScholarshipMatching';
import { useInView } from 'react-intersection-observer';
import type { ScoredScholarship, UserAnswers } from '../types';

interface ResultsProps {
  answers: UserAnswers;
}

export function Results({ answers }: ResultsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minAmount: 0,
    maxAmount: 100000,
    competition: [] as string[],
    showSavedOnly: false,
    sortBy: 'match' // match, amount, deadline
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<string | null>(null);
  const [explanationLoading, setExplanationLoading] = useState<Record<string, boolean>>({});

  // Custom hooks for scholarship matching and saving
  const { matchResult, loading, error, getExplanation } = useScholarshipMatching(answers);
  const { savedIds, toggleSave, isSaved } = useSavedScholarships(user?.id);

  // Intersection observer for scroll animations
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Filter scholarships based on search term and filters
  const filteredScholarships = React.useMemo(() => {
    let results = [...matchResult.scholarships];
    
    // Filter by active tab/category
    if (activeTab !== 'all' && activeTab !== 'saved') {
      const category = matchResult.categories.find(c => c.name === activeTab);
      if (category) {
        results = [...category.scholarships];
      }
    }
    
    // Filter by saved status if needed
    if (activeTab === 'saved' || filters.showSavedOnly) {
      results = results.filter(s => savedIds.includes(s.id));
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        s => s.name.toLowerCase().includes(term) || 
             (s.provider && s.provider.toLowerCase().includes(term)) ||
             (s.major && s.major.toLowerCase().includes(term))
      );
    }
    
    // Apply amount filter
    results = results.filter(
      s => s.amount >= filters.minAmount && s.amount <= filters.maxAmount
    );
    
    // Apply competition filter
    if (filters.competition.length > 0) {
      results = results.filter(
        s => filters.competition.includes(s.competition_level)
      );
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
      default: // match
        results.sort((a, b) => b.score - a.score);
        break;
    }
    
    return results;
  }, [matchResult, activeTab, searchTerm, filters, savedIds]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      minAmount: 0,
      maxAmount: 100000,
      competition: [],
      showSavedOnly: false,
      sortBy: 'match'
    });
    setSearchTerm('');
  };

  // Toggle competition filter
  const toggleCompetitionFilter = (level: string) => {
    setFilters(prev => {
      if (prev.competition.includes(level)) {
        return {
          ...prev,
          competition: prev.competition.filter(l => l !== level)
        };
      } else {
        return {
          ...prev,
          competition: [...prev.competition, level]
        };
      }
    });
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

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Render scholarship card
  const renderScholarshipCard = (scholarship: ScoredScholarship, index: number) => (
    <motion.div
      key={scholarship.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-[#2A2D3A] relative hover:border-blue-500/30 transition-all duration-200"
    >
      {scholarship.score >= 98 && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span>Perfect Match</span>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {scholarship.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {scholarship.requirements || 'No specific requirements listed'}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4 mr-1 text-green-500" />
              <span>${scholarship.amount.toLocaleString()}</span>
            </div>
            {scholarship.deadline && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{formatDate(scholarship.deadline)}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-1 text-purple-500" />
              <span className="capitalize">{scholarship.competition_level} Competition</span>
            </div>
            {scholarship.is_local && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                <span>{scholarship.state || 'Local'}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {scholarship.major && (
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                {scholarship.major}
              </span>
            )}
            {scholarship.education_level && (scholarship.education_level as string[]).map((level, i) => (
              <span key={i} className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded">
                {level}
              </span>
            ))}
            {scholarship.gpa_requirement && (
              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                GPA: {scholarship.gpa_requirement}+
              </span>
            )}
            {scholarship.is_pell_eligible && (
              <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                Pell Grant Eligible
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => toggleSave(scholarship)}
          className={`text-gray-400 hover:text-blue-500 transition-colors ${
            isSaved(scholarship.id) ? 'text-blue-500' : ''
          }`}
        >
          <Bookmark
            className={`w-6 h-6 ${isSaved(scholarship.id) ? 'fill-blue-500 text-blue-500' : ''}`}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-blue-500 font-medium">
            {scholarship.score}% Match
          </div>
          <button
            onClick={() => handleGetExplanation(scholarship)}
            disabled={explanationLoading[scholarship.id]}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            {explanationLoading[scholarship.id] ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Brain className="w-4 h-4 mr-1" />
            )}
            Why?
          </button>
        </div>

        <a
          href={scholarship.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            scholarship.link ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          <span>{scholarship.link ? 'Apply Now' : 'Coming Soon'}</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {expandedScholarshipId === scholarship.id && scholarship.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-[#2A2D3A]/50 rounded-lg text-gray-400 text-sm"
        >
          <div className="flex items-start gap-2">
            <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <div className="font-medium text-white mb-1">Match Details:</div>
              <div>{scholarship.explanation}</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Render category tabs
  const renderCategoryTabs = () => {
    const allCategories = [
      { name: 'all', label: 'All Scholarships', count: matchResult.totalMatches },
      ...matchResult.categories,
      { name: 'saved', label: 'Saved', count: savedIds.length }
    ];

    return (
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
        {allCategories.map(category => (
          <button
            key={category.name}
            onClick={() => setActiveTab(category.name)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === category.name
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <span>{category.name === 'all' ? category.label : category.name}</span>
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
              {category.count}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            <span>Scholarship Matches</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your Personalized Scholarship Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your profile, we've found {matchResult.totalMatches} scholarships that match your qualifications
          </p>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Finding your best scholarship matches...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && matchResult.totalMatches === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>No Results</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Scholarships Found</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any scholarships matching your criteria. Try adjusting your search parameters or check back later for new opportunities.
            </p>
          </motion.div>
        )}

        {!loading && !error && matchResult.totalMatches > 0 && (
          <>
            {/* Category Tabs */}
            {renderCategoryTabs()}
            
            {/* Search and Filter Bar */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search scholarships..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] text-gray-900 dark:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Expanded Filters */}
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-medium mb-3">Competition Level</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.competition.includes('Low')}
                            onChange={() => toggleCompetitionFilter('Low')}
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 dark:text-gray-300">Low Competition</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.competition.includes('Medium')}
                            onChange={() => toggleCompetitionFilter('Medium')}
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 dark:text-gray-300">Medium Competition</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.competition.includes('High')}
                            onChange={() => toggleCompetitionFilter('High')}
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 dark:text-gray-300">High Competition</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-medium mb-3">Sort By</h3>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                        className="w-full p-2 bg-white/5 border border-gray-200 dark:border-[#2A2D3A] rounded-lg text-gray-900 dark:text-white"
                      >
                        <option value="match">Match Score</option>
                        <option value="amount">Award Amount</option>
                        <option value="deadline">Deadline (Soonest)</option>
                      </select>
                      
                      <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.showSavedOnly}
                            onChange={() => setFilters({...filters, showSavedOnly: !filters.showSavedOnly})}
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-600 dark:text-gray-300">Show Saved Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Filter Summary */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-gray-600 dark:text-gray-400">
                  Showing {filteredScholarships.length} of {matchResult.totalMatches} scholarships
                </div>
                
                {(searchTerm || filters.competition.length > 0 || filters.showSavedOnly || filters.maxAmount < 100000) && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Scholarship Cards */}
            <div className="space-y-6">
              {filteredScholarships.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A]">
                  <p className="text-gray-600 dark:text-gray-400">No scholarships match your current filters. Try adjusting your search criteria.</p>
                </div>
              ) : (
                filteredScholarships.map((scholarship, index) => renderScholarshipCard(scholarship, index))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}