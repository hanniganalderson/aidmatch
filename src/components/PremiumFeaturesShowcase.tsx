import { motion } from 'framer-motion';
import { Sparkles, FileText, Calendar, Zap, Award } from 'lucide-react';

export function PremiumFeaturesShowcase() {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'AI Essay Assistance',
      description: 'Get AI-powered help with crafting compelling scholarship essays'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Deadline Reminders',
      description: 'Never miss an application deadline with personalized reminders'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'One-Click Apply',
      description: 'Apply to multiple scholarships with a single click'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Unlimited Scholarships',
      description: 'Save and track as many scholarships as you want'
    }
  ];
  
  return (
    <div className="py-12 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Features</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Your Full Potential
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AidMatch Plus gives you access to powerful tools designed to maximize your scholarship success.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 