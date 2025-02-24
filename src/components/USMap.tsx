import React from 'react';
import { motion } from 'framer-motion';
import { states } from '../constants';

interface USMapProps {
  selectedState: string;
  onStateSelect: (state: string) => void;
}

export function USMap({ selectedState, onStateSelect }: USMapProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {states.map((state) => (
          <motion.button
            key={state}
            onClick={() => onStateSelect(state)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg text-sm transition-all ${
              selectedState === state
                ? 'bg-[#5865F2] text-white'
                : 'bg-[#222222] text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
            }`}
          >
            {state}
          </motion.button>
        ))}
      </div>
    </div>
  );
}