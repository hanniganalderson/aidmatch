import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useSubscription } from '../contexts/SubscriptionContext';

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [countdown, setCountdown] = useState(5);
  
  // Get the session ID from the URL
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Refresh the subscription status
    refreshSubscription();
    
    // Start countdown for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to AidMatch Plus!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your subscription has been activated successfully. You now have access to all premium features!
        </p>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
            <Sparkles className="w-5 h-5" />
            <span>Premium features unlocked</span>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Redirecting in {countdown} seconds...
        </p>
      </motion.div>
    </div>
  );
} 