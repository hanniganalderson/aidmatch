import React from 'react';
import { motion } from 'framer-motion';
import { questions } from '../constants';

interface USMapProps {
  selectedState: string;
  onStateSelect: (state: string) => void;
  className?: string;
}

export function USMap({ selectedState, onStateSelect, className = "" }: USMapProps) {
  // Get states from the location question options
  const states = questions.find(q => q.id === 'location')?.options || [];

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {states.map((state) => (
          <motion.button
            key={state}
            onClick={() => onStateSelect(state)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedState === state
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white/90 dark:bg-gray-700/90 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400'
            }`}
          >
            {state}
          </motion.button>
        ))}
      </div>
    </div>
  );
}