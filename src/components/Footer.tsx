import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNewsletter } from '../lib/contact-form-service';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubscribing(true);
    setError(null);
    
    try {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Submit subscription
      const result = await subscribeToNewsletter({ email });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to subscribe. Please try again.');
      }
      
      // Success state
      setSubscribed(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Newsletter subscription error:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="relative z-10 bg-gray-950 text-white border-t border-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium mb-3 text-sm text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Find Scholarships
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm text-white">Wanting updates?</h3>
            
            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 flex items-start gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-medium text-sm">Thanks for subscribing!</p>
                    <p className="text-gray-400 text-xs mt-1">You'll receive updates on new scholarships and features.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <div className="mb-3 text-red-400 bg-red-900/20 p-2 rounded-lg border border-red-800/30 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubscribe} className="flex max-w-xs">
                    <div className="relative flex-grow">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email"
                        className="w-full pl-3 pr-4 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-white"
                        required
                        disabled={isSubscribing}
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-r-md transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSubscribing || !email}
                    >
                      {isSubscribing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                  
                  <p className="text-gray-500 text-xs mt-2">
                    Join our mailing list for scholarship updates and tips.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 mt-8 pt-4 border-t border-gray-800 text-xs">
          <div>© {new Date().getFullYear()} AidMatch</div>
          <div className="mt-2 md:mt-0">
            <a 
              href="mailto:support@aidmatch.io" 
              className="hover:text-primary-400 transition-colors"
            >
              support@aidmatch.io
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}