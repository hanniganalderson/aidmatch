import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  featureName,
  description = "Upgrade to AidMatch Plus to unlock this premium feature and many more."
}: PaywallModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };
  
  const handleUpgrade = () => {
    navigate('/plus');
    onClose();
  };
  
  const handleSignIn = () => {
    navigate('/signin');
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Premium badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full text-sm font-medium">
              <Crown className="w-3.5 h-3.5" />
              <span>Plus Feature</span>
            </div>
            
            {/* Content */}
            <div className="pt-16 pb-8 px-6 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unlock {featureName}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {description}
              </p>
              
              {/* Feature list */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                <ul className="space-y-3 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Unlimited AI scholarship recommendations
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Save unlimited scholarships to your dashboard
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Advanced essay assistance tools
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* Action buttons */}
              {user ? (
                <Button 
                  onClick={handleUpgrade}
                  variant="gradient"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Plus
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button 
                    onClick={handleSignIn}
                    variant="gradient"
                    className="w-full"
                  >
                    Sign In to Upgrade
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Already have an account? Sign in to upgrade.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 