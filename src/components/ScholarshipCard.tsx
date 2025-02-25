import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Clock, ExternalLink, BookOpen, Star, HelpCircle, PenTool, Loader2, AlertCircle, Check } from 'lucide-react';
import { getScholarshipExplanation, getEssayOutline } from '../lib/openai';
import type { Scholarship } from '../types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  userProfile: any;
}

export function ScholarshipCard({ scholarship, userProfile }: ScholarshipCardProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [essayOutline, setEssayOutline] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExplanationClick = async () => {
    if (loading || explanation) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await getScholarshipExplanation(scholarship, userProfile);
      setExplanation(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate explanation');
      console.error('Failed to get explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEssayHelp = async () => {
    if (loading || essayOutline) return;

    try {
      setLoading(true);
      setError(null);
      const result = await getEssayOutline(scholarship);
      setEssayOutline(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate essay outline');
      console.error('Failed to get essay help:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="scholarship-card"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-2">
            {scholarship.name}
          </h3>
          <div className="text-[#888888] mb-4">
            by {scholarship.provider}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#5865F2]/20 text-[#5865F2] rounded-lg">
              <Trophy className="w-5 h-5" />
              <span className="text-lg font-bold">
                ${scholarship.amount.toLocaleString()}
              </span>
            </div>
            {scholarship.match_score && (
              <div className="text-sm text-[#43B581] font-medium">
                {Math.min(scholarship.match_score, 100)}% Match
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
          <Users className="w-5 h-5 text-[#9B6DFF]" />
          <div>
            <div className="text-[#888888]">Competition</div>
            <div className="text-sm text-[#9B6DFF] font-medium">
              {scholarship.competition_level || 'Medium'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
          <Clock className="w-5 h-5 text-[#FFB224]" />
          <div>
            <div className="text-[#888888]">Deadline</div>
            <div className="text-sm text-[#FFB224] font-medium">
              {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline'}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-[#222222] p-3 rounded-lg">
          <BookOpen className="w-5 h-5 text-[#43B581]" />
          <div>
            <div className="text-[#888888]">Major</div>
            <div className="flex flex-wrap gap-2">
              {scholarship.majors ? (
                scholarship.majors.map((major: string, index: number) => (
                  <span key={index} className="text-sm text-[#43B581] font-medium">{major}</span>
                ))
              ) : (
                <span className="text-sm text-[#43B581] font-medium">{scholarship.major || 'Any Major'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-[#888888] mb-6">{scholarship.description}</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleExplanationClick}
          disabled={loading || !!explanation}
          className={`btn-outline flex items-center space-x-2 ${explanation ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : explanation ? (
            <Check className="w-4 h-4" />
          ) : (
            <HelpCircle className="w-4 h-4" />
          )}
          <span>{explanation ? 'Match Explained' : 'Why This Matches'}</span>
        </button>
        
        <button
          onClick={handleEssayHelp}
          disabled={loading || !!essayOutline}
          className={`btn-outline flex items-center space-x-2 ${essayOutline ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : essayOutline ? (
            <Check className="w-4 h-4" />
          ) : (
            <PenTool className="w-4 h-4" />
          )}
          <span>{essayOutline ? 'Essay Outline Ready' : 'Get Essay Help'}</span>
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {explanation && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-[#5865F2]/10 rounded-lg border border-[#5865F2]/20"
          >
            <h4 className="text-[#5865F2] font-medium mb-2">Why This Matches You</h4>
            <p className="text-[#888888] whitespace-pre-line">{explanation}</p>
          </motion.div>
        )}

        {essayOutline && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-[#9B6DFF]/10 rounded-lg border border-[#9B6DFF]/20"
          >
            <h4 className="text-[#9B6DFF] font-medium mb-2">Essay Outline</h4>
            <div className="text-[#888888] whitespace-pre-line">{essayOutline}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <button className="btn-outline flex items-center space-x-2">
          <Star className="w-4 h-4" />
          <span>Save for Later</span>
        </button>
        <a
          href={scholarship.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center space-x-2"
        >
          <span>Apply Now</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}