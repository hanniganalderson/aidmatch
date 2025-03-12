import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { FeatureName, FEATURE_LIMITS } from '../../lib/feature-management';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: FeatureName;
  title?: string;
  description?: string;
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  featureName,
  title,
  description
}: PaywallModalProps) {
  const navigate = useNavigate();
  const feature = FEATURE_LIMITS[featureName];
  
  // Free vs Plus plan features
  const plusFeatures = [
    'Unlimited saved scholarships',
    'AI essay assistance',
    'Advanced scholarship filters',
    'Unlimited AI recommendations',
    'Email deadline reminders',
    'Export scholarship data',
    'Priority support'
  ];
  
  const freeFeatures = [
    `Up to ${FEATURE_LIMITS[FeatureName.SAVED_SCHOLARSHIPS].freeLimit} saved scholarships`,
    `Up to ${FEATURE_LIMITS[FeatureName.AI_RECOMMENDATIONS].freeLimit} AI recommendations`,
    'Basic scholarship search',
    'Profile management',
    'Scholarship matching'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title || `Upgrade to AidMatch Plus`}
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {description || feature.upgradeMessage || 'Unlock premium features to maximize your scholarship success.'}
              </p>
            </div>
            
            {/* Plans comparison */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free plan */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Basic scholarship search</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {freeFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full"
                  >
                    Current Plan
                  </Button>
                </div>
                
                {/* Plus plan */}
                <div className="bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30 relative">
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Plus Plan</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Advanced features & unlimited access</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">$9</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {plusFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      navigate('/plus');
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 