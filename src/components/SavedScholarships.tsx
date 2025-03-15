import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, ArrowRight, Bookmark, Trophy, Users, Search, X, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useSavedScholarships } from '../hooks/useScholarshipMatching';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string;
  requirements: string;
  difficulty_score: number;
  competition_level: 'low' | 'medium' | 'high';
  roi_score: number;
  is_local: boolean;
  link: string | null;
  gpa_requirement: string;
  major: string;
  national: boolean;
  major_search: string;
  education_level: string[];
  is_recurring: boolean;
  recurring_period: string | null;
  score?: number;
}

export function SavedScholarships() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { savedScholarships, loading, error } = useSavedScholarships(user?.id);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 border-red-200 dark:border-red-800">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Saved Scholarships
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while loading your saved scholarships. Please try again later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!savedScholarships || savedScholarships.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Saved Scholarships
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              You haven't saved any scholarships yet. Browse scholarships and save the ones you're interested in.
            </p>
            <Button
              onClick={() => navigate('/questionnaire')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Scholarships
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Scholarships
        </h1>
        <Button
          onClick={() => navigate('/questionnaire')}
          variant="outline"
          className="text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
        >
          <Search className="w-4 h-4 mr-2" />
          Find More
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedScholarships.map((scholarship) => (
          <motion.div
            key={scholarship.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 h-full flex flex-col">
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {scholarship.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {scholarship.provider}
                </p>
                <div className="flex items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Amount:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    ${scholarship.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Deadline:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {/* View scholarship details */}}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  View Details
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}