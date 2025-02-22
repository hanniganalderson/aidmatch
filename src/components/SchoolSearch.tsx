// components/SchoolSearch.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import { supabase } from '../lib/supabase';

interface SchoolData {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface SchoolSearchProps {
  value?: string;
  onSelect: (school: SchoolData) => void;
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
  const [suggestions, setSuggestions] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchSchools = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error: searchError } = await supabase
          .from('schools')
          .select('id, name, city, state')
          .or(`name.ilike.%${query}%, city.ilike.%${query}%`)
          .order('name')
          .limit(8);

        if (searchError) throw searchError;

        if (data) {
          // Remove duplicates and sort by relevance
          const uniqueSchools = data.reduce<Record<string, SchoolData>>((acc, school) => {
            const key = `${school.name}-${school.city}-${school.state}`;
            if (!acc[key]) acc[key] = school;
            return acc;
          }, {});

          const sortedSchools = Object.values(uniqueSchools)
            .sort((a, b) => {
              const aExact = a.name.toLowerCase() === query.toLowerCase();
              const bExact = b.name.toLowerCase() === query.toLowerCase();
              if (aExact && !bExact) return -1;
              if (!aExact && bExact) return 1;
              return a.name.localeCompare(b.name);
            });

          setSuggestions(sortedSchools);
          setShowDropdown(true);
        }
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
    searchSchools(newValue);
  };

  const handleSchoolSelect = (school: SchoolData) => {
    const displayValue = `${school.name} - ${school.city}, ${school.state}`;
    setInput(displayValue);
    setShowDropdown(false);
    onSelect(school);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    if (value !== input) {
      setInput(value);
    }
  }, [value]);

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
          className={`w-full pl-10 pr-4 py-3 bg-[#222222] border ${error ? 'border-red-500' : 'border-[#333333]'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5865F2] transition-colors`}
        />
        {loading && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[#5865F2] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 w-full mt-2 py-1 bg-[#222222] rounded-lg border border-[#333333] max-h-60 overflow-y-auto shadow-lg"
          >
            {suggestions.map((school) => (
              <motion.button
                key={school.id}
                onClick={() => handleSchoolSelect(school)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="font-medium text-white">{school.name}</div>
                <div className="text-sm text-gray-400">{school.city}, {school.state}</div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};