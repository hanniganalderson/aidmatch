import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthError, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null, user: User | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserDisplayName: () => string;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: any) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (): string => {
    if (!user) return 'User';
    
    // Try to get display name from various sources
    const name = user.user_metadata?.name || 
                 user.user_metadata?.full_name || 
                 user.user_metadata?.preferred_username;
                 
    if (name) return name;
    
    // Fall back to email if available
    if (user.email) {
      // Return just the part before the @ symbol
      return user.email.split('@')[0];
    }
    
    // Last resort
    return 'User';
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { error, user: data.user };
    } catch (error) {
      return { error: error as Error, user: null };
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        // Make sure you have these scopes
        scopes: 'email profile',
        queryParams: {
          // These parameters help ensure you get a refresh token
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) throw error;
    
    // This data will contain a URL - the function won't actually complete
    // as the user will be redirected to Google
    console.log("OAuth Sign In Response:", data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user?.id, ...data });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    isSubscribed,
    setIsSubscribed,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getUserDisplayName,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}