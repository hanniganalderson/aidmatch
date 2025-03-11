// src/contexts/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  isSubscribed: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  isSubscribed: false,
  refreshSubscription: async () => {}
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }
      
      setSubscription(data);
    } catch (err) {
      console.error('Error in subscription fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription when user changes
  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Check if user has an active subscription
  const isSubscribed = !!subscription && subscription.status === 'active';

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      isLoading, 
      isSubscribed,
      refreshSubscription: fetchSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};