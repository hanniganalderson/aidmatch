import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Clock, Users, ArrowRight, Brain, Trophy, 
  X, Check, Sparkles, Zap, Bookmark 
} from 'lucide-react';
import { Badge } from './ui/badge';
import type { ScoredScholarship } from '../types';

interface ScholarshipCardProps {
  scholarship: ScoredScholarship;
  isSaved: boolean;
  onSave: (scholarship: ScoredScholarship) => Promise<void>;
  onExplain: (scholarship: ScoredScholarship) => Promise<void>;
  isExplaining: boolean;
  isExpanded: boolean;
  isSaving: boolean;
  index: number;
}

export function ScholarshipCard({
  scholarship,
  isSaved,
  onSave,
  onExplain,
  isExplaining,
  isExpanded,
  isSaving,
  index
}: ScholarshipCardProps) {
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Set both dates to midnight for accurate day calculation
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(scholarship.deadline);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative bg-white dark:bg-surface-dark-100/80 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-surface-dark-50/20 p-6 hover:border-primary-500/30 transition-all duration-300 shadow-md hover:shadow-premium">
        {scholarship.score >= 90 && (
          <div className="absolute -top-3 -right-3 bg-gradient-green-blue text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-glow">
            <Trophy className="w-4 h-4" />
            <span>Perfect Match</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {scholarship.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {scholarship.provider}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {scholarship.requirements || scholarship.description || 'No specific requirements listed'}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-primary-600 dark:text-primary-400">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>${scholarship.amount.toLocaleString()}</span>
              </div>
              
              {scholarship.deadline && (
                <div className={`flex items-center text-sm ${
                  daysRemaining !== null && daysRemaining <= 14 
                    ? 'text-error-600 dark:text-error-400' 
                    : 'text-accent-600 dark:text-accent-400'
                }`}>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{formatDate(scholarship.deadline)}</span>
                  {daysRemaining !== null && daysRemaining <= 14 && (
                    <span className="ml-1 font-medium">
                      ({daysRemaining} days left)
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-sm text-success-600 dark:text-success-400">
                <Users className="w-4 h-4 mr-1" />
                <span className="capitalize">
                  {scholarship.competition_level} Competition
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {scholarship.major && (
                <Badge variant="default" className="text-xs">
                  {scholarship.major}
                </Badge>
              )}
              {scholarship.education_level?.map((level, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {level}
                </Badge>
              ))}
              {scholarship.is_recurring && (
                <Badge variant="success" className="text-xs">
                  Recurring {scholarship.recurring_period || ''}
                </Badge>
              )}
              {scholarship.is_local && (
                <Badge variant="warning" className="text-xs">
                  Local
                </Badge>
              )}
              {scholarship.national && (
                <Badge variant="secondary" className="text-xs">
                  National
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {scholarship.score}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Match Score</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave(scholarship)}
              className={`mt-2 px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${isSaved
                ? 'bg-primary-500 text-white' 
                : 'bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20'}`}
              disabled={isSaving}
              aria-label={isSaved ? "Unsave scholarship" : "Save scholarship"}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Bookmark 
                  className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} 
                />
              )}
              <span className="text-sm font-medium">
                {isSaved ? "Saved" : "Save"}
              </span>
            </motion.button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => onExplain(scholarship)}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {isExplaining ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Why This Match?
              </>
            )}
          </button>

          <a
            href={scholarship.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-green text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <AnimatePresence>
          {isExpanded && scholarship.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-primary-50/50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/20"
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-2">AI Analysis:</div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {scholarship.explanation}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}