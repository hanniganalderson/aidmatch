import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import { searchSchools } from '../lib/schools';
import type { School } from '../lib/schools';

interface SchoolSearchProps {
  value?: string;
  onSelect: (school: School) => void;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export const SchoolSearch: React.FC<SchoolSearchProps> = ({
  value = '',
  onSelect,
  onChange,
  error,
  className = ''
}) => {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const searchInstitutions = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchSchools(query);
        setSuggestions(results);
      } catch (err) {
        console.error('Error searching schools:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (onChange) onChange(newValue);
    searchInstitutions(newValue);
  };

  const handleSchoolSelect = (school: School) => {
    setInput(school.name);
    onSelect(school);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setSuggestions([]);
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
          placeholder="Enter your school name"
          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5865F2]/50 focus:border-[#5865F2] transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 py-1 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-white/10 max-h-60 overflow-y-auto shadow-xl">
          {suggestions.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSchoolSelect(school)}
              className="w-full px-4 py-3 text-left hover:bg-[#5865F2]/20 transition-all"
            >
              <div className="text-white">{school.name}</div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="absolute text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};