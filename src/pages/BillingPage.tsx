import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Clock, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  created_at: string;
  updated_at: string;
}

export function BillingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [createPortalLoading, setCreatePortalLoading] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }
        
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user]);

  // Create Stripe customer portal session
  const handleOpenCustomerPortal = async () => {
    if (!user || !subscription) return;
    
    setCreatePortalLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customer_id: subscription.stripe_customer_id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setCreatePortalLoading(false);
    }
  };

  // Calculate next billing date
  const formatNextBillingDate = () => {
    if (!subscription?.updated_at) return 'Unknown';
    
    const lastUpdated = new Date(subscription.updated_at);
    const nextBilling = new Date(lastUpdated);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    
    return nextBilling.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible" 
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-8 flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Billing</h1>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !subscription ? (
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">No Active Subscription</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You don't currently have an active subscription. Upgrade to AidMatch Plus to unlock premium features.
              </p>
              <Button 
                onClick={() => navigate('/pricing')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                View Pricing
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AidMatch Plus</h2>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">$9.00 / month</p>
                  </div>
                  <Button
                    onClick={handleOpenCustomerPortal}
                    disabled={createPortalLoading}
                    className="flex items-center gap-2"
                  >
                    {createPortalLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Manage Subscription</span>
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Billing Cycle</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your subscription renews on the same day each month.
                  </p>
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Next billing date: <span className="font-medium">{formatNextBillingDate()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Subscription History</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    You've been a Plus member since:
                  </p>
                  <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(subscription.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default BillingPage;