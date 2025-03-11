import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Log subscription success
  useEffect(() => {
    const logSuccess = async () => {
      if (!user) return;
      
      try {
        // Log subscription success event
        await supabase.from('user_events').insert({
          user_id: user.id,
          user_email: user.email,
          event_type: 'subscription_success',
          metadata: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Error logging subscription success:', error);
      }
    };
    
    logSuccess();
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl max-w-md text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Subscription Successful!
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          Thank you for upgrading to AidMatch Plus! Your account has been upgraded and you now have access to all premium features.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SubscriptionSuccess;