import { Check, X, Sparkles } from 'lucide-react';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FEATURE_LIMITS, FeatureName } from '../../lib/feature-management';

export function PlanComparison() {
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  
  const features = [
    {
      name: 'Saved Scholarships',
      free: `Up to ${FEATURE_LIMITS[FeatureName.SAVED_SCHOLARSHIPS].freeLimit}`,
      plus: 'Unlimited',
      highlight: false
    },
    {
      name: 'AI Recommendations',
      free: `Up to ${FEATURE_LIMITS[FeatureName.AI_RECOMMENDATIONS].freeLimit} per month`,
      plus: 'Unlimited',
      highlight: false
    },
    {
      name: 'Basic Scholarship Search',
      free: true,
      plus: true,
      highlight: false
    },
    {
      name: 'Profile Management',
      free: true,
      plus: true,
      highlight: false
    },
    {
      name: 'AI Essay Assistance',
      free: false,
      plus: true,
      highlight: true
    },
    {
      name: 'Advanced Filters',
      free: false,
      plus: true,
      highlight: false
    },
    {
      name: 'Deadline Reminders',
      free: `Up to ${FEATURE_LIMITS[FeatureName.DEADLINE_REMINDERS].freeLimit}`,
      plus: 'Unlimited',
      highlight: false
    },
    {
      name: 'Export Data',
      free: false,
      plus: true,
      highlight: false
    },
    {
      name: 'FAFSA Optimization',
      free: false,
      plus: true,
      highlight: true
    },
    {
      name: 'Auto-Apply Features',
      free: false,
      plus: true,
      highlight: true
    },
    {
      name: 'Priority Support',
      free: false,
      plus: true,
      highlight: false
    }
  ];
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose the Right Plan for You
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          AidMatch offers flexible plans to meet your scholarship needs, whether you're just getting started or looking for comprehensive assistance.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free Plan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started with basic features</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <Button
              onClick={() => navigate('/signin')}
              variant="outline"
              className="w-full"
              disabled={isSubscribed}
            >
              {isSubscribed ? 'Current Plan is Plus' : 'Get Started'}
            </Button>
          </div>
          
          <div className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Features included:</h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.free === true ? (
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : feature.free === false ? (
                    <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
                    {typeof feature.free === 'string' && (
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {feature.free}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Plus Plan */}
        <motion.div 
          className="bg-gradient-to-b from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg overflow-hidden border border-indigo-100 dark:border-indigo-800/30 relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-6 right-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recommended
            </div>
          </div>
          
          <div className="p-6 border-b border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plus Plan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Advanced features & unlimited access</p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">$9</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <Button
              onClick={() => navigate('/plus')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
              disabled={isSubscribed}
            >
              {isSubscribed ? 'Current Plan' : 'Upgrade Now'}
            </Button>
          </div>
          
          <div className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Everything in Free, plus:</h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 ${feature.highlight ? 'text-indigo-500' : 'text-green-500'} mt-0.5 flex-shrink-0`} />
                  <div>
                    <span className={`text-gray-700 dark:text-gray-300 ${feature.highlight ? 'font-medium' : ''}`}>
                      {feature.name}
                      {feature.highlight && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                    </span>
                    {typeof feature.plus === 'string' && (
                      <span className="block text-sm text-gray-500 dark:text-gray-400">
                        {feature.plus}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 