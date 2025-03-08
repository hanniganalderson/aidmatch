import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
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
            <h3 className="font-medium mb-3 text-sm text-white">Updates on Scholarships</h3>
            
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary-600 dark:text-primary-400"
              >
                Thanks for subscribing!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-xs">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full pl-3 pr-4 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-r-md transition-colors flex items-center"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 mt-8 pt-4 border-t border-gray-800 text-xs">
          <div>© {new Date().getFullYear()} AidMatch</div>
        </div>
      </div>
    </footer>
  );
}