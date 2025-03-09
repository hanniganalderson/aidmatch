import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScholarshipMatching, useSavedScholarships } from '../hooks/useScholarshipMatching';
import { useInView } from 'react-intersection-observer';
import type { ScoredScholarship, UserAnswers, ScholarshipFilters } from '../types';
import { useNavigate } from 'react-router-dom';
import { ResultsFilters } from './ResultsFilters';
import { ScholarshipCard } from './ScholarshipCard';
import { Button } from './ui/button';

interface ResultsProps {
  answers: UserAnswers;
}

export function Results({ answers }: ResultsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedScholarshipId, setExpandedScholarshipId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Items displayed per page
  const itemsPerPage = 8;

  // **Initial filters** 
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

  // Update filtered scholarships when data, filters, or search changes
  useEffect(() => {
    if (matchResult.scholarships.length > 0) {
      let results = filterScholarships(matchResult.scholarships, filters, searchTerm);
      results = sortScholarships(results, filters.sortBy);
      setFilteredScholarships(results);
      setCurrentPage(1);
    }
  }, [matchResult, searchTerm, filters, filterScholarships, sortScholarships]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const currentScholarships = filteredScholarships.slice(
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
    try {
      const explanation = await getExplanation(scholarship);
      if (explanation) setExpandedScholarshipId(scholarship.id);
    } catch (err) {
      console.error('Error in handleExplain:', err);
    }
  };

  // Intersection observer for fade-in
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Collect a set of majors from scholarships
  const availableMajors = React.useMemo(() => {
    const majors = new Set<string>();
    matchResult.scholarships.forEach(s => {
      if (s.major) majors.add(s.major);
    });
    return Array.from(majors).sort();
  }, [matchResult.scholarships]);

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
          totalResults={filteredScholarships.length}
          resetFilters={resetFilters}
          majors={availableMajors}
          categories={matchResult.categories} // If you want to keep recommended categories
        />

        {/* Main results area */}
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
        )}
      </div>
    </div>
  );
}