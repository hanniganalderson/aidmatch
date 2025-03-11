// src/components/MinimalDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, Calendar, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import type { UserAnswers } from '../types';

// Extremely simplified dashboard with no animations, contexts, or complex components
export function MinimalDashboard({ userAnswers }: { userAnswers?: UserAnswers }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Very basic render to test if dashboard loads without error
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          <div className="mb-4">
            {auth.user ? (
              <p className="text-green-600">Welcome, {auth.getUserDisplayName()}!</p>
            ) : (
              <p className="text-amber-600">You're not logged in. Some features may be limited.</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button onClick={() => navigate('/questionnaire')}>
              Update Profile
            </Button>
            
            <Button onClick={() => navigate('/results')} variant="outline">
              Search Scholarships
            </Button>
          </div>
          
          {!auth.user && (
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Sign in for full features</p>
                <p className="text-sm text-amber-700">Create an account to save scholarships and get personalized recommendations.</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => navigate('/signin')}>
                    Sign In
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="text-blue-500" />
                <h2 className="text-lg font-semibold">Saved Scholarships</h2>
              </div>
              <p className="text-gray-600 mb-4">You don't have any saved scholarships yet.</p>
              <Button onClick={() => navigate('/results')} size="sm">Browse Scholarships</Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-red-500" />
                <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
              </div>
              <p className="text-gray-600 mb-4">No upcoming scholarship deadlines.</p>
              <Button onClick={() => navigate('/results')} size="sm" variant="outline">Find Scholarships</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}