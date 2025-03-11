import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function SubscriptionCancel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Log subscription cancellation
  useEffect(() => {
    const logCancellation = async () => {
      if (!user) return;
      
      try {
        // Log subscription cancellation event
        await supabase.from('user_events').insert({
          user_id: user.id,
          user_email: user.email,
          event_type: 'subscription_cancellation',
          metadata: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        console.error('Error logging subscription cancellation:', error);
      }
    };
    
    logCancellation();
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
          className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Subscription Cancelled
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-300 mb-6"
        >
          Your subscription process was cancelled. No charges have been made. You can upgrade anytime when you're ready.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col space-y-4"
        >
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Pricing
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SubscriptionCancel;