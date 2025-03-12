import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function SubscriptionCancel() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
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
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription Canceled
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your subscription cancellation has been processed. You'll still have access to Plus features until the end of your current billing period.
        </p>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Dashboard
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Redirecting in {countdown} seconds...
        </p>
      </motion.div>
    </div>
  );
}