import { Trophy, TrendingUp, Users, Star } from 'lucide-react';
import type { Scholarship } from '../types';

const exampleScholarship: Scholarship = {
  id: '1',
  name: 'Future Tech Leaders Scholarship',
  provider: 'Innovation Foundation',
  amount: 25000,
  deadline: '2024-05-01',
  effortLevel: 'Medium',
  matchScore: 92,
  description: 'Supporting next-generation technology innovators',
  eligibility: ['STEM majors', '3.5+ GPA', 'US resident'],
  applicationUrl: '#',
  roiFactors: {
    awardSize: 90,
    applicationEase: 85,
    competition: 75
  }
};

export function ScholarshipPreview() {
  return (
    <div className="scholarship-card w-full max-w-lg mx-auto mt-16 p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{exampleScholarship.name}</h3>
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">{exampleScholarship.matchScore}% Match</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-4">
        by {exampleScholarship.provider}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-300">${exampleScholarship.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-300">Easy to Apply</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
          <Users className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-gray-300">Low Competition</span>
        </div>
      </div>
      
      <button className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group">
        View Details 
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}