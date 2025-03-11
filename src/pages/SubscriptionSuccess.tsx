// src/pages/SubscriptionSuccess.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Zap, Crown, ArrowRight, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import { PlusBadge } from '../components/ui/PlusBadge';

export function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();

  // Log subscription success and refresh the subscription context
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

        // Refresh subscription data
        await refreshSubscription();
      } catch (error) {
        console.error('Error logging subscription success:', error);
      }
    };
    
    logSuccess();
  }, [user, refreshSubscription]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }
  };

  const glowVariants = {
    animate: {
      boxShadow: ['0 0 20px rgba(124, 58, 237, 0.3)', '0 0 30px rgba(124, 58, 237, 0.5)', '0 0 20px rgba(124, 58, 237, 0.3)'],
      scale: [1, 1.02, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(79,70,229,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(79,70,229,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] animate-drift pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-800/10 blur-[100px] animate-drift-slow pointer-events-none"></div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl p-8 relative"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-indigo-100 dark:border-indigo-800/30"
        >
          {/* Success header */}
          <div className="pt-8 pb-6 px-8 text-center relative bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              variants={glowVariants}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2"
              variants={itemVariants}
            >
              <span>Welcome to AidMatch</span>
              <PlusBadge />
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-1"
              variants={itemVariants}
            >
              Your subscription is now active!
            </motion.p>
            
            <motion.p 
              className="text-sm text-gray-500 dark:text-gray-400"
              variants={itemVariants}
            >
              You now have access to all premium features.
            </motion.p>
          </div>

          {/* Features grid */}
          <div className="p-8">
            <motion.h2 
              variants={itemVariants}
              className="text-xl font-medium text-gray-900 dark:text-white mb-6"
            >
              You've Unlocked:
            </motion.h2>
            
            <motion.div 
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full mt-0.5">
                  <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Unlimited AI Recommendations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">More personalized scholarship matches</p>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30 flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-full mt-0.5">
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Essay Assistance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered essay help and feedback</p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full mt-0.5">
                  <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Priority Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deadline reminders and application updates</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30 flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full mt-0.5">
                  <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Premium Support</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get help with your scholarship journey</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col space-y-4"
            >
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-medium"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/account/billing')}
                className="w-full py-3 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors"
              >
                Manage Subscription
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 20px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes drift-slow {
          0% { transform: translate(0, 0); }
          50% { transform: translate(15px, -20px); }
          100% { transform: translate(0, 0); }
        }
        .animate-drift {
          animation: drift 15s ease-in-out infinite;
        }
        .animate-drift-slow {
          animation: drift-slow 18s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default SubscriptionSuccess;