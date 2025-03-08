import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
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
    <footer className="relative z-10 bg-white dark:bg-[#13151E] border-t border-gray-200 dark:border-[#2A2D3A]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div>
            <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 dark:text-[#888888] hover:text-blue-500 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Stay Updated</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for the latest scholarship opportunities.
            </p>
            
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-500/10 text-blue-500 rounded-lg text-sm"
              >
                Thanks for subscribing!
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1E2A] border border-gray-200 dark:border-[#2A2D3A] rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-r-lg transition-colors flex items-center"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="text-center text-gray-600 dark:text-[#888888] mt-12 pt-6 border-t border-gray-200 dark:border-[#2A2D3A]">
          © {new Date().getFullYear()} AidMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}