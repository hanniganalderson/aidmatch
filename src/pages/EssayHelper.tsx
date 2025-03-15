import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, ArrowRight, Lightbulb, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { EssayAssistant } from '../components/EssayAssistant';
import { PlusBadge } from '../components/ui/PlusBadge';
import { Button } from '../components/ui/button';

export function EssayHelper() {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8 text-center"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
          >
            AI Essay Helper
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Get personalized assistance with your scholarship essays
          </motion.p>
        </motion.div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Essay Assistant */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <motion.div variants={itemVariants}>
              <EssayAssistant className="h-full" />
            </motion.div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Plus Upgrade Card (for non-subscribers) */}
            {!isSubscribed && (
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl overflow-hidden text-white">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">Upgrade to Plus</h3>
                    </div>
                    
                    <p className="text-white/90 mb-4 text-sm">
                      Get advanced essay assistance with our Plus subscription:
                    </p>
                    
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Detailed analysis of scholarship objectives</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Example paragraphs showing effective writing</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Unlimited essay assistance requests</span>
                      </li>
                    </ul>
                    
                    <Button
                      onClick={() => window.location.href = '/plus'}
                      className="w-full bg-white text-indigo-600 hover:bg-white/90"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Essay Writing Tips */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Essay Writing Tips
                  </h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 dark:text-amber-500 text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Start with a compelling hook</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Grab the reader's attention with a personal story, surprising fact, or thought-provoking question.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 dark:text-amber-500 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Be authentic</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Scholarship committees want to hear your genuine voice and unique perspective.
                        </p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 dark:text-amber-500 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Revise and proofread</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Always review your essay multiple times and ask others for feedback before submitting.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default EssayHelper; 