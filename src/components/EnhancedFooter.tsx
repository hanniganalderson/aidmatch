import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, Github, Twitter, Linkedin, 
  Heart, ArrowRight, CheckCircle 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/use-toast';

export function EnhancedFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { email, subscribed_at: new Date().toISOString() }
        ]);
        
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - email already exists
          toast({
            title: 'Already Subscribed',
            description: 'This email is already receiving updates',
            variant: 'default'
          });
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: 'Success!',
          description: 'You\'ve been added to our updates list',
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      toast({
        title: 'Subscription Failed',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-indigo-100 dark:border-indigo-800/30 shadow-sm"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Stay Updated on New Scholarships
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                Join our community and be the first to know about new scholarship opportunities, application tips, and feature updates.
              </p>
            </div>
            
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">You're subscribed to updates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Subscribing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img src="/logo.svg" alt="AidMatch Logo" className="h-8 w-auto mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AidMatch</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connecting students with scholarships that match their unique profiles.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/aidmatch" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com/aidmatch" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/aidmatch" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:info@aidmatch.com" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  About
                </Link>
              </li>
              <li>
                <Link to="/plus" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  AidMatch Plus
                </Link>
              </li>
              <li>
                <Link to="/questionnaire" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Find Scholarships
                </Link>
              </li>
              <li>
                <Link to="/essay-helper" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Essay Helper
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/blog" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/guides" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Scholarship Guides
                </a>
              </li>
              <li>
                <a href="/support" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} AidMatch. All rights reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center justify-center">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

export default EnhancedFooter; 