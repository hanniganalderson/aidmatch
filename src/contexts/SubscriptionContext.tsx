// src/contexts/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  isLoading: true,
  isSubscribed: false,
  refreshSubscription: async () => {},
  error: null
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  // Function to fetch subscription data - now memoized with useCallback
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First attempt: Try to get subscription by user ID
      const { data: dataByUserId, error: errorByUserId } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (dataByUserId) {
        console.log('Found subscription by user ID:', dataByUserId);
        setSubscription(dataByUserId);
        return;
      }
      
      // Second attempt: Try to find by email (fallback)
      if (user.email) {
        const { data: customerData, error: customerError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            plan_type,
            stripe_customer_id,
            stripe_subscription_id,
            created_at,
            updated_at,
            user_id
          `)
          .eq('user_email', user.email)
          .eq('status', 'active')
          .limit(1);
        
        if (customerData && customerData.length > 0) {
          console.log('Found subscription by email:', customerData[0]);
          
          // Update the user_id field to match the current user
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ user_id: user.id })
            .eq('id', customerData[0].id);
            
          if (updateError) {
            console.error('Error updating subscription with user ID:', updateError);
          }
          
          setSubscription(customerData[0]);
          return;
        }
      }
      
      // If no subscription was found, set to null
      setSubscription(null);
      
    } catch (err) {
      console.error('Error in subscription fetch:', err);
      setError('Failed to retrieve subscription status');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch subscription when user changes or refreshToken changes
  useEffect(() => {
    fetchSubscription();
  }, [user, fetchSubscription, refreshToken]);

  // Public method to manually refresh the subscription data
  const refreshSubscription = async () => {
    // This will trigger a re-fetch by changing the refreshToken
    setRefreshToken(prev => prev + 1);
  };

  // Check if user has an active subscription
  const isSubscribed = !!subscription && subscription.status === 'active';

  return (
    <SubscriptionContext.Provider value={{ 
      subscription, 
      isLoading, 
      isSubscribed,
      refreshSubscription,
      error
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};