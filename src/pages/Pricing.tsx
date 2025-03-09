import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  CheckCircle,
  AlertCircle,
  X,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

export function Pricing(): JSX.Element {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number>(1724);

  // Animation states for staggered entrance
  const [heroVisible, setHeroVisible] = useState(false);
  const [plansVisible, setPlansVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const heroTimer = setTimeout(() => setHeroVisible(true), 100);
    const plansTimer = setTimeout(() => setPlansVisible(true), 300);
    const featuresTimer = setTimeout(() => setFeaturesVisible(true), 500);
    return () => {
      clearTimeout(heroTimer);
      clearTimeout(plansTimer);
      clearTimeout(featuresTimer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError(null);

    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Insert waitlist entry into Supabase (ensure your table name/columns match)
      const { error } = await supabase
        .from('pro_plan_waitlist')
        .insert([
          {
            email,
            name,
            source: 'pricing_page',
            joined_at: new Date().toISOString(),
            status: 'pending'
          }
        ]);
      if (error) throw error;

      setSubmitted(true);
      setWaitlistCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Waitlist error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // CSS animation classes
  const fadeIn = "transition-all duration-500 ease-out";
  const translateUp = "transform transition-transform duration-500";

  return (
    <div className="min-h-screen py-16 bg-gradient-to-b from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-900 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(29,78,216,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(29,78,216,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary-200/10 dark:bg-primary-900/10 blur-[80px] animate-float pointer-events-none"></div>
      <div className="absolute top-[40%] -right-[5%] w-[400px] h-[400px] rounded-full bg-primary-300/5 dark:bg-primary-800/10 blur-[60px] animate-float pointer-events-none" style={{ animationDelay: '-2s' }}></div>
      <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] rounded-full bg-accent-300/5 dark:bg-accent-800/10 blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '-4s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className={`text-center mb-16 ${heroVisible ? 'opacity-100' : 'opacity-0'} ${fadeIn}`}>
          <div className={`${heroVisible ? 'translate-y-0' : 'translate-y-6'} ${translateUp}`}>
            <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-500 font-medium mb-4 px-4 py-2 rounded-full">
              <Crown className="w-4 h-4" />
              <span>Join Our Waitlist</span>
            </div>
            <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Get Pro Access to
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Advanced Scholarship Tools
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Be the first to access features like AI Essay Assistant, Enhanced Match Explanations, and Unlimited Saved Scholarships.
            </p>
          </div>
        </div>

        {/* Pricing / Waitlist Card */}
        <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto ${plansVisible ? 'opacity-100' : 'opacity-0'} ${fadeIn} ${translateUp}`} style={{ transitionDelay: '200ms' }}>
          {/* Free Plan Card for context */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-8">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Free Plan</h2>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/forever</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Everything you need to start searching for scholarships.
              </p>
              <a
                href="#signup"
                className="block w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg text-center font-medium transition-colors mb-6"
              >
                Get Started
              </a>
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Limited scholarship matches</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Standard match algorithm</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-500 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Up to 5 saved scholarships</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">AI Essay Assistant (Pro Only)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-400">Application Tracking (Pro Only)</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Pro Plan Card with Waitlist Submission */}
          <div className={`bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm rounded-xl overflow-hidden relative border border-primary-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${plansVisible ? 'opacity-100' : 'opacity-0'} ${translateUp}`} style={{ transitionDelay: '300ms' }}>
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl"></div>
            
            {/* Coming Soon Banner */}
            <div className="absolute -top-2 -right-2 z-10">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2 px-6 font-bold text-sm transform rotate-6 shadow-lg">
                COMING SOON
              </div>
            </div>
            
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold text-white">Pro Plan</h2>
              </div>
              
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              
              <p className="text-gray-300 mb-6">
                Unlock advanced features for more scholarship opportunities and insights.
              </p>
              
              <div className="relative mb-6">
                {submitted ? (
                  <div className="p-4 bg-primary-500/20 border border-primary-500/30 rounded-lg flex items-start gap-2 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-white font-medium">You're on the waitlist!</p>
                      <p className="text-gray-300 text-sm">We'll notify you when Pro launches.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    />
                    
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    />
                    
                    <button
                      type="submit"
                      disabled={submitting || !email}
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 disabled:opacity-70 text-white rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>Join Waitlist</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-gray-400 text-xs text-center">
                      Join {waitlistCount}+ others on the waitlist
                    </p>
                  </form>
                )}
              </div>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span className="text-gray-300">
                    Everything in the Free plan, plus:
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Zap className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span className="text-gray-300">
                    AI Essay Assistant – Personalized help with scholarship essays
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Star className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span className="text-gray-300">
                    Enhanced AI Match Explanations – Deeper insights on your eligibility
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span className="text-gray-300">
                    Unlimited scholarship matches and saved opportunities
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-primary-400 mt-0.5" />
                  <span className="text-gray-300">
                    Priority Support – Get help when you need it most
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <div className="p-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl border border-primary-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Your Scholarship Journey Today
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <a
                  href="#signup"
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>Get Started for Free</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
                <a
                  href="#questionnaire"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>Take the Quiz</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
              
              <p className="text-gray-400 mt-4 text-sm">
                No credit card required. Start finding scholarships in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
          }
          .animate-float {
            animation: float 15s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
}