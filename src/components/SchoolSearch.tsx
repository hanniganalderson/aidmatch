import { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SchoolData } from '../types';

interface SchoolSearchProps {
  value: string;
  onSelect: (school: SchoolData) => void;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function SchoolSearch({
  value = '',
  onSelect,
  onChange,
  error,
  className = ''
}: SchoolSearchProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Fallback school data in case Supabase connection fails
  const fallbackSchools: SchoolData[] = [
    { id: '1', name: 'Harvard University' },
    { id: '2', name: 'Stanford University' },
    { id: '3', name: 'Massachusetts Institute of Technology' },
    { id: '4', name: 'University of California, Berkeley' },
    { id: '5', name: 'University of Michigan' },
    { id: '6', name: 'New York University' },
    { id: '7', name: 'University of Texas at Austin' },
    { id: '8', name: 'University of Washington' },
    { id: '9', name: 'University of California, Los Angeles' },
    { id: '10', name: 'University of Illinois Urbana-Champaign' }
  ];

  // Load initial popular schools on mount
  useEffect(() => {
    const loadPopularSchools = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // Load popular schools from Supabase
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name')
          .limit(10);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          // If no data returned, use fallback schools
          setSuggestions(fallbackSchools);
          console.log('Using fallback school data - no results from database');
        } else {
          // Format data to match SchoolData type
          const formattedData: SchoolData[] = data.map(school => ({
            id: school.id,
            name: school.name
          }));
          
          setSuggestions(formattedData);
          console.log('Loaded schools from Supabase:', formattedData.length);
        }
      } catch (err) {
        console.error('Error loading initial schools:', err);
        setFetchError('Failed to load schools. Using default options.');
        // Provide fallback data
        setSuggestions(fallbackSchools);
      } finally {
        setLoading(false);
      }
    };
    
    loadPopularSchools();
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    if (value !== input) {
      setInput(value);
    }
  }, [value]);

  // Search schools based on user input
  const searchSchools = useCallback(async (query: string) => {
    setFetchError(null);
    if (!query || query.length < 2) {
      // If query is too short, show popular schools
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name')
          .limit(10);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          // If no data returned, use fallback schools
          setSuggestions(fallbackSchools);
        } else {
          // Format data to match SchoolData type
          const formattedData: SchoolData[] = data.map(school => ({
            id: school.id,
            name: school.name
          }));
          
          setSuggestions(formattedData);
        }
      } catch (err) {
        console.error('Error fetching popular schools:', err);
        setFetchError('Failed to load schools. Using default options.');
        // Provide fallback data
        setSuggestions(fallbackSchools);
      }
      return;
    }

    setLoading(true);
    try {
      // Simple ILIKE search for school names
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(15);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        // No results found, but don't show error - user can enter custom school
        setSuggestions([]);
        return;
      }
      
      // Format data to match SchoolData type
      const formattedData: SchoolData[] = data.map(school => ({
        id: school.id,
        name: school.name
      }));
      
      // Sort results to prioritize matches at the beginning of the name
      const sortedData = [...formattedData].sort((a, b) => {
        // Prioritize exact matches
        if (a.name.toLowerCase() === query.toLowerCase()) return -1;
        if (b.name.toLowerCase() === query.toLowerCase()) return 1;
        
        // Then prioritize matches at the beginning of the name
        const aStartsWithQuery = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWithQuery = b.name.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;
        
        // Default to alphabetical order
        return a.name.localeCompare(b.name);
      });
      
      setSuggestions(sortedData);
    } catch (err) {
      console.error('Error searching schools:', err);
      setFetchError('Failed to search schools. Try entering your school manually.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search to prevent too many API calls
  const debouncedSearchSchools = useCallback(
    debounce((query: string) => searchSchools(query), 300),
    [searchSchools]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (onChange) {
      onChange(newValue);
    }
    debouncedSearchSchools(newValue);
    setShowDropdown(true);
  };

  // Handle school selection
  const handleSchoolSelect = (school: SchoolData) => {
    setInput(school.name);
    onSelect(school);
    setShowDropdown(false);
  };

  // Handle manual entry (when school not found in database)
  const handleManualEntry = () => {
    const customSchool: SchoolData = {
      id: 'custom-' + Date.now(),
      name: input
    };
    onSelect(customSchool);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={componentRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Enter your school name"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {input && (
            <button 
              onClick={() => {
                setInput('');
                if (onChange) {
                  onChange('');
                }
                debouncedSearchSchools('');
                setShowDropdown(false);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute z-20 w-full mt-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto shadow-xl">
          <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
            {loading ? 'Searching...' : 'Suggested Schools'}
          </div>

          {fetchError && (
            <div className="px-4 py-2 text-sm text-red-500 border-b border-gray-200 dark:border-gray-600">
              {fetchError}
            </div>
          )}

          {suggestions.length > 0 ? (
            suggestions.map((school) => (
              <button
                key={school.id}
                onClick={() => handleSchoolSelect(school)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
              >
                <div className="text-gray-900 dark:text-white">{school.name}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
              {loading ? 'Searching...' : 'No schools found'}
            </div>
          )}
          
          {/* Manual input option */}
          {input.length > 0 && (
            <button
              onClick={handleManualEntry}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border-t border-gray-200 dark:border-gray-600"
            >
              <div className="text-gray-900 dark:text-white">Use "{input}"</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                School not found? Click to use this name.
              </div>
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

// Utility function to debounce API calls
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}