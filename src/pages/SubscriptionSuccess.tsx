// src/pages/EnhancedSubscriptionSuccess.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, AlertCircle, Sparkles, Zap, 
  Award, BookOpen, Clock, Calendar, 
  ArrowRight, RefreshCw 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import { SubscriptionBadge } from '../components/ui/SubscriptionBadge';

export function EnhancedSubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isSubscribed, refreshSubscription } = useSubscription();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingStatus, setSyncingStatus] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const setupIntent = queryParams.get('setup_intent');
  const paymentIntent = queryParams.get('payment_intent');
  
  // Track initialization to avoid duplicate calls
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to check and log subscription status
  const checkSubscriptionStatus = async () => {
    if (!user?.id) return;
    
    try {
      setSyncingStatus(true);
      
      // First check if we already have an active subscription
      if (isSubscribed) {
        setStatusChecked(true);
        return;
      }
      
      // Force refresh subscription data from the server
      await refreshSubscription();
      
      // Log the checkout success event
      await supabase.from('user_events').insert({
        user_id: user.id,
        event_type: 'checkout_success_page_viewed',
        metadata: { 
          session_id: sessionId || 'unknown',
          setup_intent: setupIntent || 'unknown',
          payment_intent: paymentIntent || 'unknown',
          retry_count: retryCount,
          timestamp: new Date().toISOString()
        }
      });
      
      setStatusChecked(true);
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError('There was an issue verifying your subscription. Please try refreshing or contact support.');
    } finally {
      setSyncingStatus(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    // Avoid multiple initialization
    if (isInitialized) return;
    setIsInitialized(true);
    
    const initPage = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          // If no user, wait a moment in case auth is still loading
          setTimeout(() => {
            if (!user) {
              setError('User authentication required. Please sign in.');
              setLoading(false);
            }
          }, 2000);
          return;
        }
        
        // Check subscription status
        await checkSubscriptionStatus();
      } catch (err) {
        console.error('Error initializing success page:', err);
        setError('An unexpected error occurred. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    initPage();
  }, [user, isInitialized]);
  
  // Retry logic for subscription status
  useEffect(() => {
    // If already checked successfully or too many retries, don't try again
    if (statusChecked || retryCount >= 3 || !user) return;
    
    // Set up a retry timer if user exists but status check hasn't succeeded
    const retryTimer = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      checkSubscriptionStatus();
    }, 3000); // 3 second delay between retries
    
    return () => clearTimeout(retryTimer);
  }, [statusChecked, retryCount, user]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    await checkSubscriptionStatus();
  };

  // Content to show when loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activating Your Subscription</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we activate your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Error state */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-100 dark:border-red-800/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Button
                        onClick={handleManualRefresh}
                        disabled={syncingStatus}
                        size="sm"
                        className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                      >
                        {syncingStatus ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Refresh Status
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => navigate('/account/billing')}
                        size="sm"
                        variant="outline"
                      >
                        Check Billing
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Header */}
            <div className="pt-10 pb-8 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15, 
                  delay: 0.2 
                }}
                className="w-24 h-24 mx-auto relative mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-20 animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                  Welcome to AidMatch
                  <SubscriptionBadge variant="glow" size="lg" />
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-lg mx-auto">
                  Your premium subscription is now active!
                </p>
              </motion.div>
            </div>
            
            {/* Features Grid */}
            <div className="px-8 pb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Congratulations! You've Unlocked:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {/* AI Recommendations */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                  <div className="flex gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-full h-fit">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Unlimited AI Recommendations</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Generate custom scholarship matches tailored to your academic profile
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                        variant="link"
                        className="mt-2 p-0 h-auto text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700"
                      >
                        Try it now
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Essay Assistance */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
                  <div className="flex gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-full h-fit">
                      <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Essay Assistance</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Get AI-powered help with drafting and optimizing your application essays
                      </p>
                      <div className="mt-2 inline-flex items-center text-xs font-medium text-purple-600 dark:text-purple-400">
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Coming soon
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Deadline Tracking */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                  <div className="flex gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full h-fit">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Advanced Deadline Tracking</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Get notifications for scholarship deadlines and organize your applications
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate('/results')}
                        variant="link"
                        className="mt-2 p-0 h-auto text-green-600 dark:text-green-400 font-medium hover:text-green-700"
                      >
                        Browse scholarships
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Priority Support */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <div className="flex gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full h-fit">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Priority Support</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Get prioritized assistance with your scholarship application process
                      </p>
                      <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        Available 24/7 at support@aidmatch.co
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="mt-8 space-y-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/account/billing')}
                  className="w-full py-3"
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Support Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help with your subscription? Contact us at{' '}
              <a href="mailto:support@aidmatch.co" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                support@aidmatch.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedSubscriptionSuccess;