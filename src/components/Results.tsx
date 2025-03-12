import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Search, ChevronLeft, ChevronRight, Sparkles, AlertCircle, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScholarshipMatching, useSavedScholarships } from '../hooks/useScholarshipMatching';
import { getAIScholarshipRecommendations, getCachedAIScholarships } from "../lib/AIScholarshipService";
import { useInView } from 'react-intersection-observer';
import type { ScoredScholarship, UserAnswers, ScholarshipFilters } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResultsFilters } from './ResultsFilters';
import { ScholarshipCard } from './ScholarshipCard';
import { Button } from './ui/button';

interface ResultsProps {
  answers: UserAnswers;
}

export function Results({ answers }: ResultsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Check URL parameters for active tab
  const [activeTab, setActiveTab] = useState<'verified' | 'ai'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'ai' ? 'ai' : 'verified';
  });
  
  // AI recommendations state
  const [aiScholarships, setAiScholarships] = useState<ScoredScholarship[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Items displayed per page
  const itemsPerPage = 8;

  // Initial filters
  const [filters, setFilters] = useState<ScholarshipFilters>({
    minAmount: 0,
    maxAmount: 100000,
    competition: [],
    showSavedOnly: false,
    sortBy: 'match',
    scope: [],
    deadline: null,
    educationLevel: [],
    major: null,
    needBased: null,
    essayRequired: null
  });

  // Hooks to fetch scholarship data
  const { 
    matchResult, 
    loading, 
    error, 
    getExplanation, 
    explanationLoading,
    filterScholarships,
    sortScholarships
  } = useScholarshipMatching(answers);

  const {
    isSaved,
    toggleSave,
    isSaving
  } = useSavedScholarships(user?.id);

  // Filtered scholarships state
  const [filteredScholarships, setFilteredScholarships] = useState<ScoredScholarship[]>([]);
  const [filteredAiScholarships, setFilteredAiScholarships] = useState<ScoredScholarship[]>([]);

  // Load any cached AI scholarships on mount
  useEffect(() => {
    const cachedScholarships = getCachedAIScholarships();
    if (cachedScholarships && cachedScholarships.length > 0) {
      setAiScholarships(cachedScholarships);
    }
  }, []);

  // Update filtered scholarships when data, filters, or search changes
  useEffect(() => {
    if (matchResult.scholarships.length > 0) {
      let results = filterScholarships(matchResult.scholarships, filters, searchTerm);
      results = sortScholarships(results, filters.sortBy);
      setFilteredScholarships(results);
      setCurrentPage(1);
    }
  }, [matchResult, searchTerm, filters, filterScholarships, sortScholarships]);

  // Apply same filters to AI scholarships
  useEffect(() => {
    if (aiScholarships.length > 0) {
      let results = filterScholarships(aiScholarships, filters, searchTerm);
      results = sortScholarships(results, filters.sortBy);
      setFilteredAiScholarships(results);
    }
  }, [aiScholarships, searchTerm, filters, filterScholarships, sortScholarships]);

  // Generate AI scholarship recommendations
  const generateAIRecommendations = async () => {
    if (isGeneratingAI) return;
    
    setIsGeneratingAI(true);
    setAiError(null);
    
    try {
      const recommendations = await getAIScholarshipRecommendations(answers, 8);
      
      if (recommendations.length === 0) {
        setAiError("We couldn't generate recommendations at this time. Please try again later.");
      } else {
        setAiScholarships(recommendations);
        
        // Auto-switch to AI tab if generation is successful
        setActiveTab('ai');
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      setAiError("An error occurred while generating recommendations. Please try again later.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Calculate pagination
  const activeScholarships = activeTab === 'verified' ? filteredScholarships : filteredAiScholarships;
  const totalPages = Math.ceil(activeScholarships.length / itemsPerPage);
  const currentScholarships = activeScholarships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset filters to default
  const resetFilters = () => {
    setFilters({
      minAmount: 0,
      maxAmount: 100000,
      competition: [],
      showSavedOnly: false,
      sortBy: 'match',
      scope: [],
      deadline: null,
      educationLevel: [],
      major: null,
      needBased: null,
      essayRequired: null
    });
    setSearchTerm('');
  };

  // Handle explanation expansion
  const handleExplain = async (scholarship: ScoredScholarship) => {
    if (expandedScholarshipId === scholarship.id) {
      // Collapse if same ID
      setExpandedScholarshipId(null);
      return;
    }
    
    // For AI-generated scholarships, we don't need to fetch explanations
    if (scholarship.is_ai_generated) {
      setExpandedScholarshipId(scholarship.id);
      return;
    }
    
    try {
      const explanation = await getExplanation(scholarship);
      if (explanation) setExpandedScholarshipId(scholarship.id);
    } catch (err) {
      console.error('Error in handleExplain:', err);
    }
  };

  // Intersection observer for fade-in
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4" />
            <span className="font-medium">Your Financial Aid Matches</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Your Perfect Financial Aid Opportunities
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your profile, we've found {matchResult?.totalMatches || 0} opportunities 
            that match your qualifications. Adjust your filters below to refine your search.
          </p>
        </motion.div>

        {/* Results Filters */}
        <ResultsFilters
          filters={filters}
          setFilters={setFilters}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalResults={activeScholarships.length}
          resetFilters={resetFilters}
        />

        {/* Tab navigation for Verified vs AI */}
        <div className="flex items-center mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('verified')}
            className={`relative py-3 px-5 text-sm font-medium transition-colors ${
              activeTab === 'verified' 
                ? 'text-primary-500 border-b-2 border-primary-500' 
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Verified Scholarships
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('ai')}
            className={`relative py-3 px-5 text-sm font-medium transition-colors ${
              activeTab === 'ai' 
                ? 'text-primary-500 border-b-2 border-primary-500' 
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              AI Recommendations
            </span>
          </button>
          
          {aiScholarships.length === 0 && !isGeneratingAI && (
            <div className="ml-auto">
              <Button
                onClick={generateAIRecommendations}
                className="flex items-center gap-2"
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Recommendations
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Main results area */}
        {activeTab === 'verified' ? (
          // Verified scholarships section
          <>
            {loading ? (
              <div className="text-center py-24">
                <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Finding your best financial aid matches...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400">
                <p>{error}</p>
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="text-center py-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md">
                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {searchTerm 
                    ? "Try adjusting your search terms or filters to see more results." 
                    : "We couldn't find any financial aid matches with your current filters."}
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentScholarships.map((scholarship, index) => (
                  <ScholarshipCard 
                    key={scholarship.id}
                    scholarship={scholarship}
                    isSaved={isSaved(scholarship.id)}
                    onSave={async (sch) => {
                      await toggleSave(sch);
                    }}
                    onExplain={() => handleExplain(scholarship)}
                    isExplaining={!!explanationLoading[scholarship.id]}
                    isExpanded={expandedScholarshipId === scholarship.id}
                    isSaving={!!isSaving[scholarship.id]}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // AI recommendations section
          <>
            {isGeneratingAI ? (
              <div className="text-center py-24">
                <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating your AI scholarship recommendations...
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  This may take a few moments...
                </p>
              </div>
            ) : aiError ? (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                <p>{aiError}</p>
                <Button
                  variant="outline"
                  onClick={generateAIRecommendations}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : aiScholarships.length === 0 ? (
              <div className="text-center py-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md">
                <div className="mx-auto w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Discover AI-Powered Recommendations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Our AI can analyze your profile and suggest additional scholarship opportunities that might be a good match for you.
                </p>
                <Button
                  onClick={generateAIRecommendations}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Recommendations
                </Button>
              </div>
            ) : filteredAiScholarships.length === 0 ? (
              <div className="text-center py-16 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md">
                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No AI recommendations match your filters
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Try adjusting your search terms or filters to see more results.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-primary-50/50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-lg flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-200 text-sm">
                      <span className="font-medium">AI-Generated Recommendations:</span> These scholarship suggestions are generated by AI based on your profile. While they represent potential opportunities, they may require additional verification. Each recommendation is personalized to your background in {answers.major} with a GPA of {answers.gpa}.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {filteredAiScholarships.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  ).map((scholarship, index) => (
                    <ScholarshipCard 
                      key={scholarship.id}
                      scholarship={scholarship}
                      isSaved={isSaved(scholarship.id)}
                      onSave={async (sch) => {
                        await toggleSave(sch);
                      }}
                      onExplain={() => handleExplain(scholarship)}
                      isExplaining={false}
                      isExpanded={expandedScholarshipId === scholarship.id}
                      isSaving={!!isSaving[scholarship.id]}
                      index={index}
                      isAIGenerated={true}
                    />
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={generateAIRecommendations}
                    className="flex items-center gap-2"
                    disabled={isGeneratingAI}
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Recommendations
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 bg-white dark:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  // Show all pages if total <= 5
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Near start
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Near end
                  pageNum = totalPages - 4 + i;
                } else {
                  // Middle
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 ${
                      currentPage === pageNum 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 bg-white dark:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}