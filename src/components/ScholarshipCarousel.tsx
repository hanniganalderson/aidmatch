import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Clock, Users, ChevronRight, Star, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Fallback scholarships in case Supabase fetch fails
const fallbackScholarships = [
  {
    id: '1',
    name: "Future Tech Leaders Scholarship",
    amount: 25000,
    deadline: "2024-05-01",
    provider: "Innovation Foundation",
    competition_level: "Medium",
    requirements: "GPA: 3.5 or higher, Major: Computer Science or related",
    match: 95
  },
  {
    id: '2',
    name: "STEM Diversity Grant",
    amount: 15000,
    deadline: "2024-06-15",
    provider: "Tech for All Foundation",
    competition_level: "Low",
    requirements: "GPA: 3.0 or higher, Underrepresented groups in STEM",
    match: 92
  },
  {
    id: '3',
    name: "Academic Excellence Award",
    amount: 20000,
    deadline: "2024-04-30",
    provider: "Education First",
    competition_level: "High",
    requirements: "GPA: 3.8 or higher, Leadership experience",
    match: 88
  }
];

export function ScholarshipCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scholarships, setScholarships] = useState(fallbackScholarships);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch scholarships from Supabase
    const fetchScholarships = async () => {
      try {
        const { data, error } = await supabase
          .from('scholarship_scraped')
          .select('id, name, provider, amount, deadline, competition_level, requirements')
          .limit(5)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add a simulated match score
          const withMatchScores = data.map(scholarship => ({
            ...scholarship,
            match: Math.floor(Math.random() * 15) + 85 // Random score between 85-99
          }));
          setScholarships(withMatchScores);
        }
      } catch (error) {
        console.error('Error fetching scholarships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  // Auto-rotate scholarships
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % scholarships.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [scholarships.length]);

  const currentScholarship = scholarships[currentIndex] || fallbackScholarships[0];

  // Helper functions for formatting
  const getCompetitionColor = (level) => {
    switch(level) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCompetitionBg = (level) => {
    switch(level) {
      case 'Low': return 'bg-green-50 dark:bg-green-900/20';
      case 'Medium': return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'High': return 'bg-red-50 dark:bg-red-900/20';
      default: return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return { formatted: 'No deadline', daysLeft: null, isUrgent: false };
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      formatted: date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
      daysLeft: diffDays,
      isUrgent: diffDays <= 14 && diffDays > 0
    };
  };

  const formatRequirements = (reqString) => {
    if (!reqString) return [];
    const requirements = reqString.split(/[,.]+/).filter(req => req.trim().length > 0);
    return requirements.slice(0, 3); // Limit to 3 requirements
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto h-[360px] flex items-center justify-center bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse text-primary-500">Loading scholarships...</div>
      </div>
    );
  }

  const deadline = formatDeadline(currentScholarship.deadline);
  const requirements = formatRequirements(currentScholarship.requirements);

  return (
    <div className="relative py-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"></div>
      </div>
      
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
        Featured Scholarships
      </div>
      
      {/* Carousel content */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="relative w-full max-w-md mx-auto h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <div className="relative backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden shadow-lg hover:shadow-primary transition-all duration-300">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  />
                </div>

                {/* Scholarship content */}
                <div className="pt-2">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-16">
                      {currentScholarship.name}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                      <Star className="w-3 h-3 fill-primary-500" />
                      <span className="text-xs font-medium">
                        {currentScholarship.match}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    by {currentScholarship.provider}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-8">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                      <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400 mb-1" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${currentScholarship.amount?.toLocaleString() || 'Varies'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Award</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-3 rounded-lg bg-secondary-100 dark:bg-secondary-900/20">
                      <Clock className="w-4 h-4 text-secondary-600 dark:text-secondary-400 mb-1" />
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {deadline.formatted}
                        </span>
                        {deadline.isUrgent && (
                          <span className="text-xs text-red-500 font-medium">
                            {deadline.daysLeft} days left
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Deadline</span>
                    </div>
                    
                    <div className={`flex flex-col items-center p-3 rounded-lg ${getCompetitionBg(currentScholarship.competition_level)}`}>
                      <Users className={`w-4 h-4 ${getCompetitionColor(currentScholarship.competition_level)} mb-1`} />
                      <span className={`text-sm font-medium text-gray-900 dark:text-white`}>
                        {currentScholarship.competition_level || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Competition</span>
                    </div>
                  </div>

                  {/* Requirements section */}
                  <div className="mb-6">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Requirements</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      {requirements.length > 0 ? (
                        requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                            <span>{req.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5"></div>
                          <span>See scholarship details for requirements</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* View details link */}
                  <div className="flex justify-between items-center">
                    <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    
                    <button className="group flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {scholarships.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-600 dark:bg-primary-500 scale-125'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-400 dark:hover:bg-primary-700'
                }`}
                aria-label={`View scholarship ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}