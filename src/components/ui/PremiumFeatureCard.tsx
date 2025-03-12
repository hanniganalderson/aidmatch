import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}

export function PremiumFeatureCard({ 
  title, 
  description, 
  icon,
  children 
}: PremiumFeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-indigo-100 dark:border-gray-700 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Plus
        </div>
      </div>
      
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      
      {children}
    </motion.div>
  );
} 