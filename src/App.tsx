// src/App.tsx (updated with Simplified Dashboard)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { Questionnaire } from './components/Questionnaire';
import { Results } from './components/Results';
// Import the simplified dashboard instead
import { Dashboard } from './components/Dashboard';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { About } from './components/About';
import { Settings } from './components/Settings';
import { SavedScholarships } from './components/SavedScholarships';
import { InputScholarship } from './components/InputScholarship';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Fix: Added useAuth import
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { Plus } from './pages/Plus';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancel from './pages/SubscriptionCancel';
import BillingPage from './pages/BillingPage';
import { clearOAuthErrorParams, processHashErrors } from './lib/auth-utils';
import type { UserAnswers } from './types';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SubscriptionSuccessPage } from './pages/SubscriptionSuccessPage';
import { EssayAssistant } from './pages/tools/EssayAssistant';
import { FinancialOptimizer } from './pages/tools/FinancialOptimizer';
import { DeadlineTracker } from './pages/tools/DeadlineTracker';
import { AutoFillApplications } from './pages/tools/AutoFillApplications';
import { Toaster } from './components/ui/toaster';
import { EssayHelper } from './pages/EssayHelper';
import AdminDashboard from './components/AdminDashboard';
import { AdminRoute } from './components/AdminRoute';

// Import animation styles
import './styles/animations.css';

function AppContent() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<UserAnswers>({
    education_level: '',
    school: '',
    major: '',
    gpa: '',
    is_pell_eligible: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  // Process any OAuth errors in the URL hash
  useEffect(() => {
    const hashError = processHashErrors();
    if (hashError) {
      console.error('OAuth error detected:', hashError);
    }
    
    // Clear any OAuth error params from the URL
    clearOAuthErrorParams();
  }, []);

  // Load user answers from Supabase when user is available
  useEffect(() => {
    async function loadUserAnswers() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Customized logging for debugging
        console.log('Loading user profile for:', user.id);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user profile:', error);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('User profile loaded successfully');
          // Update answers state with data from database
          setAnswers({
            education_level: data.education_level || '',
            school: data.school || '',
            major: data.major || '',
            gpa: data.gpa || '',
            is_pell_eligible: data.is_pell_eligible || '',
            location: data.location || ''
          });
        } else {
          console.log('No user profile found, using defaults');
        }
      } catch (err) {
        console.error('Error fetching user answers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserAnswers();
  }, [user]);

  // Function to save user answers to Supabase
  const saveUserAnswers = async (newAnswers: UserAnswers) => {
    if (!user) return { error: 'User not authenticated' };
    
    try {
      // First update local state
      setAnswers(newAnswers);
      
      // Then save to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...newAnswers,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error saving user answers:', err);
      return { error: 'Failed to save your answers' };
    }
  };

  // Handle answers submit from questionnaire
  const handleSubmitAnswers = async (newAnswers: UserAnswers) => {
    setAnswers(newAnswers);
    if (user) {
      await saveUserAnswers(newAnswers);
    }
  };

  if (loading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/results" element={<Results />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute>
            <SavedScholarships />
          </ProtectedRoute>
        } />
        <Route path="/input-scholarship" element={
          <ProtectedRoute>
            <InputScholarship />
          </ProtectedRoute>
        } />
        <Route path="/contribute" element={
          <ProtectedRoute>
            <InputScholarship />
          </ProtectedRoute>
        } />
        
        {/* Premium features */}
        <Route path="/tools/essay-assistant" element={
          <ProtectedRoute requiresSubscription>
            <EssayAssistant />
          </ProtectedRoute>
        } />
        
        {/* Other routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/plus" element={<Plus />} />
        <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
        <Route path="/account/billing" element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <AppContent />
            <Toaster />
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;