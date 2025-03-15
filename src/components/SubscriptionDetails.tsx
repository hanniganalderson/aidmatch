import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, CreditCard, CheckCircle, 
  AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { getSubscriptionExpirationDate } from '../lib/subscription-utils';
import { useAuth } from '../contexts/AuthContext';

export function SubscriptionDetails() {
  const { user } = useAuth();
  const { 
    isSubscribed, 
    subscriptionStatus, 
    refreshSubscription 
  } = useSubscription();
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchExpirationDate = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const date = await getSubscriptionExpirationDate(user.id);
        setExpirationDate(date);
      } catch (error) {
        console.error('Error fetching expiration date:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpirationDate();
  }, [user, subscriptionStatus]);
  
  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Subscription Details
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refreshSubscription()}
          className="h-8"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      {isSubscribed ? (
        <>
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-400">
                AidMatch Plus Active
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                You have access to all premium features
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">Plan</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">AidMatch Plus</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">Billing</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">Monthly</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">Next billing date</span>
              </div>
              {loading ? (
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(expirationDate)}
                </span>
              )}
            </div>
            
            {subscriptionStatus === 'canceled' && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-400">
                    Subscription Canceled
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                    Your subscription will end on {formatDate(expirationDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => navigate('/account/billing')}
              className="w-full"
            >
              Manage Subscription
            </Button>
            
            {subscriptionStatus === 'canceled' && (
              <Button
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="w-full"
              >
                Renew Subscription
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-300">
                Free Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Upgrade to AidMatch Plus for premium features
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to Plus
          </Button>
        </>
      )}
    </Card>
  );
} 