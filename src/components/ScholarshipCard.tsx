import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  ArrowRight,
  Bookmark,
  Trophy,
  Users,
  MapPin,
  DollarSign,
  Sparkles
} from 'lucide-react';
import type { ScoredScholarship } from '../types';

interface ScholarshipCardProps {
  scholarship: ScoredScholarship;
  index: number;
  isSaved: boolean;
  onSave: (scholarship: ScoredScholarship) => Promise<boolean>;
  onExplain: (scholarship: ScoredScholarship) => Promise<void>;
  expanded: boolean;
  explanationLoading: boolean;
}

export function ScholarshipCard({
  scholarship,
  index,
  isSaved,
  onSave,
  onExplain,
  expanded,
  explanationLoading
}: ScholarshipCardProps) {
  const [saving, setSaving] = useState(false);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle save functionality
  const handleSave = async () => {
    setSaving(true);
    await onSave(scholarship);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200 dark:border-[#2A2D3A] relative hover:border-blue-500/30 transition-all duration-200"
    >
      {/* Perfect Match Badge */}
      {scholarship.score >= 90 && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          <span>Perfect Match</span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {scholarship.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {scholarship.requirements || 'No specific requirements listed'}
          </p>

          {/* Scholarship Details */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="w-4 h-4 mr-1 text-green-500" />
              <span>${scholarship.amount.toLocaleString()}</span>
            </div>
            {scholarship.deadline && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{formatDate(scholarship.deadline)}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4 mr-1 text-purple-500" />
              <span className="capitalize">{scholarship.competition_level} Competition</span>
            </div>
            {scholarship.is_local && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                <span>{scholarship.state || 'Local'}</span>
              </div>
            )}
          </div>

          {/* Major Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {scholarship.major &&
              scholarship.major.split(',').map((major, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium"
                >
                  {major.trim()}
                </span>
              ))}
          </div>

          {/* Expandable Section */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gray-50 dark:bg-[#2A2D3A]/40 p-4 rounded-lg border border-gray-200 dark:border-[#2A2D3A]"
            >
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Why This Scholarship?</h4>
              {explanationLoading ? (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Sparkles className="w-4 h-4 animate-spin text-yellow-500" />
                  <span>Generating explanation...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">{scholarship.explanation || 'No explanation available.'}</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end">
          <button
            onClick={handleSave}
            className={`flex items-center text-sm px-3 py-1 rounded-md transition-all ${
              isSaved
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            disabled={saving}
          >
            <Bookmark className="w-4 h-4 mr-1" />
            {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={() => onExplain(scholarship)}
            className="flex items-center text-sm mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-all"
          >
            <Brain className="w-4 h-4 mr-1" />
            Explain Match
          </button>

          {scholarship.link && (
            <a
              href={scholarship.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm mt-2 bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded-md transition-all"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Apply Now
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}