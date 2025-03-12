import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Shield, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export function PremiumAccountSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
        }),
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Plus Subscription</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Method</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Visa ending in 4242</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Billing Cycle</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next payment on April 12, 2025</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Shield className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Plan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">AidMatch Plus ($9.99/month)</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          onClick={handleManageSubscription}
          disabled={loading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          Manage Subscription
        </Button>
      </div>
    </motion.div>
  );
} 