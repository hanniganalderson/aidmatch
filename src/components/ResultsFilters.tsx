import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, X, 
  DollarSign, Calendar, Award,
  ChevronUp, SlidersHorizontal, 
  FileText, Bookmark, BarChart
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Filters {
  minAmount: number;
  maxAmount: number;
  competition: string[];
  showSavedOnly: boolean;
  sortBy: string;
  scope: string[];
  deadline: string | null;
  educationLevel: string[];
  major: string | null;
  needBased: boolean | null;
  essayRequired: boolean | null;
}

interface FiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalResults: number;
  resetFilters: () => void;
}

export function ResultsFilters({
  filters,
  setFilters,
  filtersOpen,
  setFiltersOpen,
  searchTerm,
  setSearchTerm,
  totalResults,
  resetFilters
}: FiltersProps) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.minAmount > 0) count++;
    if (filters.maxAmount < 100000) count++;
    if (filters.showSavedOnly) count++;
    if (filters.scope.length > 0) count++;
    if (filters.deadline) count++;
    if (filters.needBased !== null) count++;
    if (filters.essayRequired !== null) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Basic arrays for filter options
  const deadlineOptions = [
    { value: null, label: 'Any deadline' },
    { value: '7', label: 'Next 7 days' },
    { value: '30', label: 'Next 30 days' },
    { value: '90', label: 'Next 3 months' }
  ];

  // ========== Filter Toggle Helpers ==========

  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleScope = (scope: string) => {
    if (filters.scope.includes(scope)) {
      setFilters({ ...filters, scope: filters.scope.filter(s => s !== scope) });
    } else {
      setFilters({ ...filters, scope: [...filters.scope, scope] });
    }
  };

  const toggleNeedBased = (value: boolean | null) => {
    setFilters({ ...filters, needBased: filters.needBased === value ? null : value });
  };

  const toggleEssayRequired = (value: boolean | null) => {
    setFilters({ ...filters, essayRequired: filters.essayRequired === value ? null : value });
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 cursor-pointer"
            onClick={handleSearchIconClick}
          >
            <Search className="w-5 h-5" />
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scholarships..."
            className="w-full pl-10 pr-4 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-sm"
          />
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-900 dark:text-white hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5 text-primary-500" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="w-4 h-4 ml-1 transition-transform text-primary-500" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 transition-transform text-primary-500" />
          )}
        </motion.button>
      </div>

      {/* Results Count and Active Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <span>
            Showing <span className="font-medium text-primary-500">{totalResults}</span> scholarships
          </span>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Renders badges for active filters */}
            {filters.minAmount > 0 || filters.maxAmount < 100000 ? (
              <FilterBadge
                label={`$${filters.minAmount.toLocaleString()} - $${filters.maxAmount.toLocaleString()}`}
                onRemove={() => setFilters({ ...filters, minAmount: 0, maxAmount: 100000 })}
              />
            ) : null}

            {filters.scope.map(scope => (
              <FilterBadge
                key={scope}
                label={scope}
                onRemove={() => toggleScope(scope)}
              />
            ))}

            {filters.deadline && (
              <FilterBadge
                label={
                  deadlineOptions.find(o => o.value === filters.deadline)?.label || filters.deadline
                }
                onRemove={() => setFilters({ ...filters, deadline: null })}
              />
            )}

            {filters.needBased !== null && (
              <FilterBadge
                label={filters.needBased ? 'Need-Based' : 'Merit-Based'}
                onRemove={() => setFilters({ ...filters, needBased: null })}
              />
            )}

            {filters.essayRequired !== null && (
              <FilterBadge
                label={filters.essayRequired ? 'Essay Required' : 'No Essay'}
                onRemove={() => setFilters({ ...filters, essayRequired: null })}
              />
            )}

            {filters.showSavedOnly && (
              <FilterBadge
                label="Saved Only"
                onRemove={() => setFilters({ ...filters, showSavedOnly: false })}
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              <X className="w-3 h-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Card-based filter container */}
            <div className="mt-4 p-6 bg-white dark:bg-gray-900/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md grid gap-6">
              
              {/* Filter Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Award Amount Range */}
                <FilterCard title="Award Amount" icon={DollarSign}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
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
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setFilters({...filters, maxAmount: 5000, minAmount: 0})}
                        className={`text-xs py-1.5 px-2 rounded-md border w-full ${
                          filters.maxAmount === 5000 && filters.minAmount === 0
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                        }`}
                      >
                        Under $5k
                      </button>
                      <button
                        onClick={() => setFilters({...filters, minAmount: 5000, maxAmount: 100000})}
                        className={`text-xs py-1.5 px-2 rounded-md border w-full ${
                          filters.minAmount === 5000
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                        }`}
                      >
                        $5k+
                      </button>
                    </div>
                  </div>
                </FilterCard>

                {/* Deadline */}
                <FilterCard title="Deadline" icon={Calendar}>
                  <select
                    value={filters.deadline || ''}
                    onChange={(e) => setFilters({...filters, deadline: e.target.value || null})}
                    className="w-full p-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {deadlineOptions.map((option) => (
                      <option key={option.value || 'any'} value={option.value || ''}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FilterCard>

                {/* Essay Requirement */}
                <FilterCard title="Essay Requirement" icon={FileText}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleEssayRequired(false)}
                      className={`flex-1 text-sm py-2 rounded-md border ${
                        filters.essayRequired === false
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      No Essay
                    </button>
                    <button
                      onClick={() => toggleEssayRequired(true)}
                      className={`flex-1 text-sm py-2 rounded-md border ${
                        filters.essayRequired === true
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      Essay Required
                    </button>
                  </div>
                </FilterCard>

                {/* Scholarship Type */}
                <FilterCard title="Scholarship Type" icon={Award}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleNeedBased(false)}
                      className={`flex-1 text-sm py-2 rounded-md border ${
                        filters.needBased === false
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      Merit-Based
                    </button>
                    <button
                      onClick={() => toggleNeedBased(true)}
                      className={`flex-1 text-sm py-2 rounded-md border ${
                        filters.needBased === true
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300'
                      }`}
                    >
                      Need-Based
                    </button>
                  </div>
                </FilterCard>

                {/* Geographic Scope */}
                <FilterCard title="Geographic Scope" icon={Award}>
                  {['Local', 'State', 'National'].map(scope => (
                    <label key={scope} className="flex items-center gap-2 text-sm mb-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.scope.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{scope}</span>
                    </label>
                  ))}
                </FilterCard>

                {/* Sort & Saved */}
                <FilterCard title="Sort & Saved" icon={BarChart}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full p-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="deadline">Deadline (Soonest)</option>
                      <option value="amount">Award Amount (Highest)</option>
                      <option value="competition">Competition (Lowest)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showSavedOnly}
                        onChange={() => setFilters({...filters, showSavedOnly: !filters.showSavedOnly})}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Show saved only</span>
                    </label>
                  </div>
                </FilterCard>
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md text-sm"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A small utility component for showing an active filter badge with an X button. */
function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
      <span>{label}</span>
      <button onClick={onRemove} className="ml-1 hover:text-primary-700">
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}

/** A small layout component for each filter section. */
function FilterCard({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm space-y-3">
      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary-500" />
        {title}
      </h3>
      {children}
    </div>
  );
}