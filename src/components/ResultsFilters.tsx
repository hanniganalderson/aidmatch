import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, X, Globe, 
  DollarSign, Tag, Users, Check, BookOpen,
  ChevronUp, GraduationCap, SlidersHorizontal, 
  Clock, Award, School, FileText, Sparkles,
  BarChart
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Category {
  name: string;
  count: number;
  scholarships: any[];
}

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
    needBased: boolean | null;
    essayRequired: boolean | null;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  filtersOpen: boolean;
  setFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalResults: number;
  resetFilters: () => void;
  majors: string[];
  categories: Category[];
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
  majors = [],
  categories = []
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
    if (filters.needBased !== null) count++;
    if (filters.essayRequired !== null) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Deadline options
  const deadlineOptions = [
    { value: null, label: 'Any deadline' },
    { value: '7', label: 'Next 7 days' },
    { value: '30', label: 'Next 30 days' },
    { value: '90', label: 'Next 3 months' }
  ];

  // Common education levels
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

  // Toggle need-based filter
  const toggleNeedBased = (value: boolean | null) => {
    setFilters({
      ...filters,
      needBased: filters.needBased === value ? null : value
    });
  };

  // Toggle essay requirement filter
  const toggleEssayRequired = (value: boolean | null) => {
    setFilters({
      ...filters,
      essayRequired: filters.essayRequired === value ? null : value
    });
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

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    // Set appropriate filters based on category
    let newFilters = {...filters};
    
    if (category === 'Best Matches') {
      newFilters.sortBy = 'match';
    } else if (category === 'Local Scholarships') {
      newFilters.scope = ['Local', 'State'];
    } else if (category === 'Major-Specific') {
      // Keep current major if set
    } else if (category === 'Easiest to Apply') {
      newFilters.competition = ['Low'];
      newFilters.essayRequired = false;
    } else if (category === 'Highest Amount') {
      newFilters.sortBy = 'amount';
      newFilters.minAmount = 5000;
    } else if (category === 'Deadline Soon') {
      newFilters.deadline = '30';
    } else if (category === 'No Essay Required') {
      newFilters.essayRequired = false;
    } else if (category === 'Need-Based') {
      newFilters.needBased = true;
    } else if (category === 'Merit-Based') {
      newFilters.needBased = false;
    }
    
    setFilters(newFilters);
  };

  // Get the appropriate icon for each category
  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Best Matches': return Award;
      case 'Local Scholarships': return School;
      case 'Major-Specific': return BookOpen;
      case 'Easiest to Apply': return Tag;
      case 'Highest Amount': return DollarSign;
      case 'Deadline Soon': return Clock;
      case 'No Essay Required': return FileText;
      case 'Need-Based': return Users;
      case 'Merit-Based': return Award;
      default: return Award;
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Recommended Categories */}
      {categories.length > 0 && (
        <div className="mb-2">
          <h2 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            Recommended Categories
          </h2>
          
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name);
              return (
                <motion.button
                  key={category.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleCategorySelect(category.name)}
                  className="flex-shrink-0 px-4 py-3 bg-white/95 dark:bg-gray-800 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-700/30 transition-all shadow-sm hover:shadow-md group"
                  title={category.name}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap text-sm">
                        {category.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {category.count} {category.count === 1 ? 'match' : 'matches'}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
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
          <span>Showing <span className="font-medium text-primary-500">{totalResults}</span> scholarships</span>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.minAmount > 0 || filters.maxAmount < 100000 ? (
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
              <Badge key={level} variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
              <Badge key={scope} variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
              <Badge key={level} variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
            
            {filters.needBased !== null && (
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
                <span>{filters.needBased ? 'Need-Based' : 'Merit-Based'}</span>
                <button 
                  onClick={() => setFilters({...filters, needBased: null})}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {filters.essayRequired !== null && (
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
                <span>{filters.essayRequired ? 'Essay Required' : 'No Essay'}</span>
                <button 
                  onClick={() => setFilters({...filters, essayRequired: null})}
                  className="ml-1 hover:text-primary-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {filters.showSavedOnly && (
              <Badge variant="outline" className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 shadow-sm border-primary-200 dark:border-primary-800/30">
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
            <div className="p-6 bg-gray-900 backdrop-blur-sm rounded-xl border border-gray-800 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {/* Award Amount Range */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-500" />
                    Award Amount
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
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
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        onClick={() => setFilters({...filters, maxAmount: 5000})}
                        className={`text-xs py-1.5 px-2 rounded-md border w-full ${
                          filters.maxAmount === 5000
                            ? 'bg-primary-900/60 border-primary-700 text-primary-200'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-primary-700'
                        }`}
                      >
                        Under $5,000
                      </button>
                      <button
                        onClick={() => setFilters({...filters, minAmount: 5000})}
                        className={`text-xs py-1.5 px-2 rounded-md border w-full ${
                          filters.minAmount === 5000
                            ? 'bg-primary-900/60 border-primary-700 text-primary-200'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-primary-700'
                        }`}
                      >
                        $5,000 or more
                      </button>
                    </div>
                  </div>
                </div>

                {/* Major Filter */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    Major
                  </h3>
                  <div className="relative" ref={majorInputRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                      <input
                        type="text"
                        value={majorSearchTerm}
                        onChange={handleMajorSearch}
                        onFocus={() => setIsMajorDropdownOpen(true)}
                        placeholder="Search for a major..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      />
                      {majorSearchTerm && (
                        <button
                          onClick={clearMajor}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
                          className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg max-h-40 overflow-y-auto hide-scrollbar"
                        >
                          {filteredMajors.map((major) => (
                            <button
                              key={major}
                              onClick={() => selectMajor(major)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white flex items-center justify-between"
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

                {/* Deadline Filter */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    Deadline
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={filters.deadline || ''}
                      onChange={(e) => setFilters({...filters, deadline: e.target.value || null})}
                      className="w-full p-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary-500" />
                    Geographic Scope
                  </h3>
                  <div className="space-y-2">
                    {['Local', 'State', 'National'].map((scope) => (
                      <label key={scope} className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => toggleScope(scope)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            filters.scope.includes(scope)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-800 border border-gray-600'
                          }`}
                        >
                          {filters.scope.includes(scope) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-sm text-gray-300">
                          {scope}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Competition Level */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
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
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-800 border border-gray-600'
                          }`}
                        >
                          {filters.competition.includes(level) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-sm text-gray-300">
                          {level} Competition
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Need-Based vs Merit-Based */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-500" />
                    Scholarship Type
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleNeedBased(true)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        filters.needBased === true
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-primary-700'
                      }`}
                    >
                      Need-Based
                    </button>
                    <button
                      onClick={() => toggleNeedBased(false)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        filters.needBased === false
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-primary-700'
                      }`}
                    >
                      Merit-Based
                    </button>
                  </div>
                </div>

                {/* Essay Requirement */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-500" />
                    Essay Requirement
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleEssayRequired(false)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        filters.essayRequired === false
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-primary-700'
                      }`}
                    >
                      No Essay
                    </button>
                    <button
                      onClick={() => toggleEssayRequired(true)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        filters.essayRequired === true
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-primary-700'
                      }`}
                    >
                      Essay Required
                    </button>
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    Education Level
                  </h3>
                  <div className="space-y-2 h-32 overflow-y-auto pr-2 hide-scrollbar">
                    {educationLevelOptions.map((level) => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <button
                          onClick={() => toggleEducationLevel(level)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            filters.educationLevel.includes(level)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-800 border border-gray-600'
                          }`}
                        >
                          {filters.educationLevel.includes(level) && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-sm text-gray-300">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort By + Saved Filter */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-primary-500" />
                      Sort By
                    </h3>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full p-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="match">Best Match</option>
                      <option value="deadline">Deadline (Soonest)</option>
                      <option value="amount">Award Amount (Highest)</option>
                      <option value="competition">Competition (Lowest)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary-500" />
                      Saved Scholarships
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        onClick={() => setFilters({...filters, showSavedOnly: !filters.showSavedOnly})}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          filters.showSavedOnly
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-800 border border-gray-600'
                        }`}
                      >
                        {filters.showSavedOnly && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span className="text-sm text-gray-300">
                        Show saved scholarships only
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-300 border-gray-700 hover:bg-gray-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
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