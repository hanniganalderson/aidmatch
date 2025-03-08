import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Search, ChevronDown, X, Globe, 
  Calendar, DollarSign, Tag, Crown, Users, Check, BookOpen,
  ChevronUp, GraduationCap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FiltersProps {
  filters: {
    minAmount: number;
    maxAmount: number;
    competition: string[];
    showSavedOnly: boolean;
    sortBy: string;
    scope: string[];
    deadline: string | null;
    educationLevel: string[];
    major: string | null;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalResults: number;
  resetFilters: () => void;
  majors: string[];
}

export function ResultsFilters({
  filters,
  setFilters,
  filtersOpen,
  setFiltersOpen,
  searchTerm,
  setSearchTerm,
  totalResults,
  resetFilters,
  majors = []
}: FiltersProps) {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMajorDropdownOpen, setIsMajorDropdownOpen] = useState(false);
  const majorInputRef = useRef<HTMLInputElement>(null);
  const [majorSearchTerm, setMajorSearchTerm] = useState('');
  const [filteredMajors, setFilteredMajors] = useState<string[]>([]);
  
  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.minAmount > 0) count++;
    if (filters.maxAmount < 100000) count++;
    if (filters.competition.length > 0) count++;
    if (filters.showSavedOnly) count++;
    if (filters.scope.length > 0) count++;
    if (filters.deadline) count++;
    if (filters.educationLevel.length > 0) count++;
    if (filters.major) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Deadline options
  const deadlineOptions = [
    { value: null, label: 'Any deadline' },
    { value: '7', label: 'Next 7 days' },
    { value: '30', label: 'Next 30 days' },
    { value: '90', label: 'Next 3 months' },
    { value: '180', label: 'Next 6 months' }
  ];

  // Education level options
  const educationLevelOptions = [
    'High School Senior',
    'College Freshman',
    'College Sophomore',
    'College Junior', 
    'College Senior',
    'Masters Student',
    'PhD Student'
  ];

  // Handle input focus when search icon is clicked
  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Add or remove competition level filter
  const toggleCompetition = (level: string) => {
    if (filters.competition.includes(level)) {
      setFilters({
        ...filters,
        competition: filters.competition.filter(l => l !== level)
      });
    } else {
      setFilters({
        ...filters,
        competition: [...filters.competition, level]
      });
    }
  };

  // Add or remove scope filter
  const toggleScope = (scope: string) => {
    if (filters.scope.includes(scope)) {
      setFilters({
        ...filters,
        scope: filters.scope.filter(s => s !== scope)
      });
    } else {
      setFilters({
        ...filters,
        scope: [...filters.scope, scope]
      });
    }
  };

  // Add or remove education level filter
  const toggleEducationLevel = (level: string) => {
    if (filters.educationLevel.includes(level)) {
      setFilters({
        ...filters,
        educationLevel: filters.educationLevel.filter(l => l !== level)
      });
    } else {
      setFilters({
        ...filters,
        educationLevel: [...filters.educationLevel, level]
      });
    }
  };

  // Handle major search
  const handleMajorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMajorSearchTerm(value);
    
    if (value.trim()) {
      const filtered = majors.filter(major => 
        major.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMajors(filtered);
    } else {
      setFilteredMajors(majors.slice(0, 20)); // Show first 20 majors as default
    }
  };

  // Select a major
  const selectMajor = (major: string) => {
    setFilters({ ...filters, major });
    setMajorSearchTerm(major);
    setIsMajorDropdownOpen(false);
  };

  // Clear major filter
  const clearMajor = () => {
    setFilters({ ...filters, major: null });
    setMajorSearchTerm('');
  };

  // Initialize filtered majors
  useEffect(() => {
    setFilteredMajors(majors.slice(0, 20));
  }, [majors]);

  // Close major dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (majorInputRef.current && !majorInputRef.current.contains(event.target as Node)) {
        setIsMajorDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the major input when dropdown is opened
  useEffect(() => {
    if (isMajorDropdownOpen && majorInputRef.current) {
      majorInputRef.current.focus();
    }
  }, [isMajorDropdownOpen]);

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
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
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark-100/80 rounded-lg border border-gray-200 dark:border-surface-dark-50/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
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
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-surface-dark-50/30 bg-white dark:bg-surface-dark-100/80 text-gray-900 dark:text-white hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-500 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {filtersOpen ? (
            <ChevronUp className="w-4 h-4 ml-1 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 transition-transform" />
          )}
        </motion.button>
      </div>

      {/* Results Count and Active Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <span>Showing {totalResults} results</span>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.minAmount > 0 || filters.maxAmount < 100000 ? (
              <Badge variant="default" className="flex items-center gap-1">
                <span>${filters.minAmount.toLocaleString()} - ${filters.maxAmount.toLocaleString()}</span>
                <button 
                  onClick={() => setFilters({...filters, minAmount: 0, maxAmount: 100000})}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : null}
            
            {filters.competition.map(level => (
              <Badge key={level} variant="default" className="flex items-center gap-1">
                <span>{level} Competition</span>
                <button 
                  onClick={() => toggleCompetition(level)}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {filters.scope.map(scope => (
              <Badge key={scope} variant="default" className="flex items-center gap-1">
                <span>{scope}</span>
                <button 
                  onClick={() => toggleScope(scope)}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {filters.educationLevel.map(level => (
              <Badge key={level} variant="default" className="flex items-center gap-1">
                <span>{level}</span>
                <button 
                  onClick={() => toggleEducationLevel(level)}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            
            {filters.major && (
              <Badge variant="default" className="flex items-center gap-1">
                <span>Major: {filters.major}</span>
                <button 
                  onClick={clearMajor}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {filters.deadline && (
              <Badge variant="default" className="flex items-center gap-1">
                <span>
                  {deadlineOptions.find(option => option.value === filters.deadline)?.label || filters.deadline}
                </span>
                <button 
                  onClick={() => setFilters({...filters, deadline: null})}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {filters.showSavedOnly && (
              <Badge variant="default" className="flex items-center gap-1">
                <span>Saved Only</span>
                <button 
                  onClick={() => setFilters({...filters, showSavedOnly: false})}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white dark:bg-surface-dark-100/80 rounded-lg border border-gray-200 dark:border-surface-dark-50/30 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Award Amount Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-500" />
                    Award Amount
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
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
                      className="w-full h-2 bg-gray-200 dark:bg-surface-dark-50/30 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setFilters({...filters, maxAmount: 5000})}
                        className={`text-xs py-1 px-2 rounded border ${
                          filters.maxAmount === 5000
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200'
                            : 'bg-gray-100 dark:bg-surface-dark-50/30 border-gray-200 dark:border-surface-dark-50/20 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Under $5,000
                      </button>
                      <button
                        onClick={() => setFilters({...filters, maxAmount: 10000})}
                        className={`text-xs py-1 px-2 rounded border ${
                          filters.maxAmount === 10000
                            ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200'
                            : 'bg-gray-100 dark:bg-surface-dark-50/30 border-gray-200 dark:border-surface-dark-50/20 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Under $10,000
                      </button>
                    </div>
                  </div>
                </div>

                {/* Competition Level */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    Competition Level
                  </h3>
                  <div className="space-y-2">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => toggleCompetition(level)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            filters.competition.includes(level)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 dark:bg-surface-dark-50/30'
                          }`}
                        >
                          {filters.competition.includes(level) && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {level} Competition
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Deadline Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    Deadline
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={filters.deadline || ''}
                      onChange={(e) => setFilters({...filters, deadline: e.target.value || null})}
                      className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-surface-dark-50/30 bg-white dark:bg-surface-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    >
                      {deadlineOptions.map((option) => (
                        <option key={option.value || 'any'} value={option.value || ''}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Geographic Scope Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary-500" />
                    Geographic Scope
                  </h3>
                  <div className="space-y-2">
                    {['Local', 'State', 'National', 'International'].map((scope) => (
                      <label key={scope} className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => toggleScope(scope)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            filters.scope.includes(scope)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 dark:bg-surface-dark-50/30'
                          }`}
                        >
                          {filters.scope.includes(scope) && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {scope}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    Education Level
                  </h3>
                  <div className="h-40 overflow-y-auto pr-2 space-y-2">
                    {educationLevelOptions.map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => toggleEducationLevel(level)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            filters.educationLevel.includes(level)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-200 dark:bg-surface-dark-50/30'
                          }`}
                        >
                          {filters.educationLevel.includes(level) && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Major Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    Major
                  </h3>
                  <div className="relative" ref={majorInputRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={majorSearchTerm}
                        onChange={handleMajorSearch}
                        onFocus={() => setIsMajorDropdownOpen(true)}
                        placeholder="Search for a major..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-surface-dark-100 rounded-lg border border-gray-200 dark:border-surface-dark-50/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 text-sm"
                      />
                      {majorSearchTerm && (
                        <button
                          onClick={clearMajor}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {isMajorDropdownOpen && filteredMajors.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-1 w-full bg-white dark:bg-surface-dark-100 rounded-lg border border-gray-200 dark:border-surface-dark-50/30 shadow-lg max-h-40 overflow-y-auto"
                        >
                          {filteredMajors.map((major) => (
                            <button
                              key={major}
                              onClick={() => selectMajor(major)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-900 dark:text-white flex items-center justify-between"
                            >
                              <span>{major}</span>
                              {filters.major === major && (
                                <Check className="w-4 h-4 text-primary-500" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Saved Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary-500" />
                    Saved Scholarships
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <button
                      onClick={() => setFilters({...filters, showSavedOnly: !filters.showSavedOnly})}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        filters.showSavedOnly
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 dark:bg-surface-dark-50/30'
                      }`}
                    >
                      {filters.showSavedOnly && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Show saved scholarships only
                    </span>
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary-500" />
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full p-2 text-sm rounded-lg border border-gray-200 dark:border-surface-dark-50/30 bg-white dark:bg-surface-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="deadline">Deadline (Soonest)</option>
                      <option value="competition">Competition (Lowest)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFiltersOpen(false)}
                  className="px-4 py-2 bg-gradient-green text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}