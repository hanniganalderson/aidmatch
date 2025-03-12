import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Calendar,
  MessageSquare,
  Search,
  Award
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createCheckoutSession } from '../lib/subscriptionService';
import { Button } from '../components/ui/button';
import { SimpleCheckoutButton } from '../components/SimpleCheckoutButton';

export function Plus(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isHoveringPlus, setIsHoveringPlus] = useState(false);

  // Use intersection observer for scroll animations
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [plansRef, plansInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Check if user has subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking subscription:', error);
        }
        
        setUserSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      }
    };
    
    checkSubscription();
  }, [user]);

  const handleUpgrade = async () => {
    // If user isn't logged in, redirect to sign in
    if (!user) {
      navigate('/signin', { state: { returnTo: '/plus'} });
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('Starting checkout process for email:', user.email);
      
      // Ensure we have a valid email before proceeding
      if (!user.email) {
        throw new Error('User email not available');
      }
      
      await createCheckoutSession(user.email);
      
      // If createCheckoutSession doesn't throw, it will redirect the user
      // We shouldn't reach this code, but just in case:
      console.log('Checkout initiated successfully');
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unknown error occurred during checkout'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleManageSubscription = () => {
    // Redirect to account/billing page
    navigate('/account/billing');
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
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const plusCardVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: 0.2 }
    }
  };

  const highlightFeature = {
    hidden: { opacity: 0, backgroundColor: "rgba(79, 70, 229, 0)" },
    visible: { 
      opacity: 1, 
      backgroundColor: ["rgba(79, 70, 229, 0)", "rgba(79, 70, 229, 0.1)", "rgba(79, 70, 229, 0)"],
      transition: { duration: 2, times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 5 }
    }
  };

  // Feature lists
  const freeFeatures = [
    { icon: <Search size={18} />, text: "Limited scholarship matches (5 per month)" },
    { icon: <Check size={18} />, text: "Basic eligibility information" },
    { icon: <Check size={18} />, text: "Up to 3 saved scholarships" },
    { icon: <X size={18} />, text: "AI Essay Assistant", unavailable: true },
    { icon: <X size={18} />, text: "Deadline reminders", unavailable: true },
    { icon: <X size={18} />, text: "Application tracking", unavailable: true }
  ];

  const plusFeatures = [
    { icon: <Check size={18} />, text: "Everything in Free, plus:" },
    { icon: <Search size={18} />, text: "Unlimited scholarship matches" },
    { icon: <Sparkles size={18} />, text: "AI-powered essay assistant" },
    { icon: <Award size={18} />, text: "Enhanced AI match explanations" },
    { icon: <Calendar size={18} />, text: "Deadline reminders & tracking" },
    { icon: <MessageSquare size={18} />, text: "Priority support" }
  ];

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-indigo-50 via-indigo-50/50 to-white dark:from-gray-900 dark:via-indigo-950/5 dark:to-gray-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(79,70,229,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(79,70,229,0.04)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-300/20 dark:bg-indigo-900/10 blur-[120px] animate-drift pointer-events-none"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-800/10 blur-[100px] animate-drift-slow pointer-events-none"></div>
      
      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center mb-20"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 px-4 py-2 rounded-full">
              <Crown className="w-4 h-4" />
              <span className="font-medium">Choose Your Plan</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Unlock Your Scholarship <span className="text-indigo-600 dark:text-indigo-400">Potential</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get access to more opportunities and powerful tools to help you secure the funding you need for your education.
            </p>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          ref={plansRef}
          initial="hidden"
          animate={plansInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24"
        >
          {/* Free Plan */}
          <motion.div 
            variants={cardVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h2>
                  <p className="text-gray-500 dark:text-gray-400">Essential tools to get started</p>
                </div>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full text-sm font-medium">
                  Limited
                </span>
              </div>
              
              <div className="flex items-baseline mt-6 mb-6">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
              </div>
              
              <Button 
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 mb-8"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              
              <div className="space-y-4">
                {freeFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    variants={checkmarkVariants}
                    className={`flex items-start gap-3 ${feature.unavailable ? 'opacity-60' : ''}`}
                  >
                    <div className={`p-1 rounded-full ${feature.unavailable ? 'text-gray-400 dark:text-gray-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {feature.icon}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Plus Plan */}
          <motion.div 
            variants={cardVariants}
            whileHover="hover"
            initial={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            animate={{ boxShadow: isHoveringPlus ? 
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : 
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
            }}
            onHoverStart={() => setIsHoveringPlus(true)}
            onHoverEnd={() => setIsHoveringPlus(false)}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-indigo-800 rounded-2xl border border-indigo-500/30 overflow-hidden relative"
          >
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-400/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
            
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    Plus <Crown className="w-5 h-5 text-yellow-300" />
                  </h2>
                  <p className="text-indigo-200">Enhanced tools for success</p>
                </div>
                <span className="bg-indigo-500/30 text-indigo-100 py-1 px-3 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              
              <div className="flex items-baseline mt-6 mb-6">
                <span className="text-5xl font-bold text-white">$9</span>
                <span className="text-indigo-200 ml-2">/month</span>
              </div>
              
              {userSubscription ? (
                <Button 
                  onClick={handleManageSubscription}
                  className="w-full bg-white hover:bg-gray-100 text-indigo-700 py-3 mb-8 flex items-center justify-center gap-2"
                >
                  <span>Manage Subscription</span>
                </Button>
              ) : (
                <Button 
                  onClick={handleUpgrade}
                  disabled={submitting}
                  className="w-full bg-white hover:bg-gray-100 text-indigo-700 py-3 mb-8 group flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                {plusFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    variants={index === 2 ? highlightFeature : checkmarkVariants}
                    className="flex items-start gap-3 p-2 rounded-lg"
                  >
                    <div className="p-1 rounded-full text-yellow-300">
                      {feature.icon}
                    </div>
                    <span className="text-white">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          ref={ctaRef}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="p-10 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl shadow-xl border border-indigo-500/20 relative overflow-hidden"
          >
            {/* Decorative Glows */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Scholarship Journey Begins Here
              </h2>
              
              <p className="text-lg text-indigo-200 max-w-2xl mx-auto mb-8">
                With AidMatch's powerful tools, you're 5x more likely to find and secure scholarship funding.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {userSubscription ? (
                  <Button
                    className="px-8 py-3 bg-white hover:bg-gray-100 text-indigo-700 rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md flex items-center gap-2"
                      onClick={handleUpgrade}
                    >
                      <Zap className="w-5 h-5" />
                      <span>Upgrade to Plus</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="px-8 py-3 border-white/30 text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                      onClick={() => navigate('/questionnaire')}
                    >
                      Start Matching
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add floating animation keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
        `
      }} />
    </div>
  );
}