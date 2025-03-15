// src/contexts/SubscriptionContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../lib/showToast';

// Context type definitions
type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'past_due' | 'unpaid' | 'none';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
  error: Error | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionData: any;
  lastChecked: Date | null;
  refreshSubscription: () => Promise<void>;
  handleSubscriptionChange: (newStatus: SubscriptionStatus) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, setIsSubscribed } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Compute isSubscribed from status
  const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  
  // Update the auth context when subscription status changes
  useEffect(() => {
    setIsSubscribed(isSubscribed);
  }, [isSubscribed, setIsSubscribed]);

  // Function to refresh subscription data
  const refreshSubscription = async () => {
    if (!user) {
      setSubscriptionStatus('none');
      setSubscriptionData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we have cached data less than 5 minutes old
      const now = new Date();
      if (
        lastChecked &&
        subscriptionData &&
        now.getTime() - lastChecked.getTime() < 5 * 60 * 1000
      ) {
        // Use cached data
        showToast.info("Using cached subscription data. We're having trouble connecting to our servers.");
        setIsLoading(false);
        return;
      }

      // Fetch subscription data from Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      // Update state with fetched data
      if (data) {
        setSubscriptionStatus(data.status as SubscriptionStatus);
        setSubscriptionData(data);
        
        // Show toast for subscription status changes
        if (data.status === 'active' && subscriptionStatus !== 'active') {
          showToast.success("Welcome to AidMatch Plus! You now have access to all premium features.");
        } else if (data.status === 'canceled' && subscriptionStatus === 'active') {
          showToast.warning("Your Plus subscription has been canceled. You'll still have access until the end of your billing period.");
        }
      } else {
        setSubscriptionStatus('none');
        setSubscriptionData(null);
      }

      setLastChecked(now);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription status changes
  const handleSubscriptionChange = (newStatus: SubscriptionStatus) => {
    setSubscriptionStatus(newStatus);
    
    // Show appropriate toast based on status change
    if (newStatus === 'active') {
      showToast.success("Your subscription is now active!");
    } else if (newStatus === 'canceled') {
      showToast.info("Your subscription has been canceled.");
    } else if (newStatus === 'past_due') {
      showToast.warning("Your subscription payment is past due. Please update your payment method.");
    }
  };

  // Fetch subscription data on mount and when user changes
  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value = {
    isSubscribed,
    isLoading,
    error,
    subscriptionStatus,
    subscriptionData,
    lastChecked,
    refreshSubscription,
    handleSubscriptionChange
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}