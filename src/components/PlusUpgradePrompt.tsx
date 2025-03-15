import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Check, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/subscriptionService';

export function PlusUpgradePrompt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleUpgrade = async () => {
    try {
      if (!user?.email) {
        navigate('/signin');
        return;
      }
      await createCheckoutSession(user.email);
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            This Feature Requires Plus
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upgrade to AidMatch Plus to unlock all premium features and maximize your scholarship potential.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Advanced AI scholarship matching</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Unlimited saved scholarships</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">AI essay assistance</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Auto-fill applications</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Plus
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoBack}
            className="w-full"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 