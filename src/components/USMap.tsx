import React from 'react';
import { motion } from 'framer-motion';

interface USMapProps {
  selectedState: string;
  onStateSelect: (state: string) => void;
}

export function USMap({ selectedState, onStateSelect }: USMapProps) {
  // Map data would go here - using a simplified version for the example
  const states = [
    { id: 'CA', name: 'California', d: 'M64.4 283.3l3.4-0.7...' },
    { id: 'NY', name: 'New York', d: 'M843.4 153.7l0.5-0.5...' },
    // ... other states
  ];

  return (
    <div className="w-full aspect-[4/3] relative">
      <svg
        viewBox="0 0 959 593"
        className="w-full h-full"
      >
        <g className="states">
          {states.map((state) => (
            <motion.path
              key={state.id}
              d={state.d}
              className={`state ${
                selectedState === state.name
                  ? 'fill-[#5865F2] stroke-white'
                  : 'fill-[#222222] stroke-[#333333] hover:fill-[#2A2A2A]'
              }`}
              onClick={() => onStateSelect(state.name)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}