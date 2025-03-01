// components/SearchInput.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  icon: Icon, 
  className = '', 
  error,
  ...props 
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-[50%] -translate-y-[50%] w-5 h-5 text-gray-400 pointer-events-none" />
    <input 
      {...props} 
      className={`w-full pl-10 pr-4 py-3 bg-[#222222] border ${
        error ? 'border-red-500' : 'border-[#333333]'
      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5865F2] transition-colors ${className}`}
    />
    {error && (
      <p className="absolute text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);