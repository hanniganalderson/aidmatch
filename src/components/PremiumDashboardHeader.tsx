import { motion } from 'framer-motion';
import { Sparkles, Crown, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PremiumDashboardHeader() {
  const { user } = useAuth();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/patterns/plus-pattern.svg')] bg-repeat opacity-20"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%', 
              opacity: 0.3 
            }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3], 
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        ))}
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-yellow-300" />
            <h2 className="text-xl font-bold">Plus Subscriber</h2>
          </div>
          <p className="text-indigo-100 max-w-md">
            Welcome back, {user?.email?.split('@')[0] || 'Scholar'}! Enjoy unlimited access to all premium features.
          </p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <div>
            <p className="text-sm font-medium">Premium Status</p>
            <p className="text-xs text-indigo-100">Active</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <Star className="w-4 h-4 text-yellow-300 mb-1" />
          <p className="text-sm font-medium">Unlimited Scholarships</p>
          <p className="text-xs text-indigo-100">Save as many as you want</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <Star className="w-4 h-4 text-yellow-300 mb-1" />
          <p className="text-sm font-medium">AI Essay Assistance</p>
          <p className="text-xs text-indigo-100">Unlimited access</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <Star className="w-4 h-4 text-yellow-300 mb-1" />
          <p className="text-sm font-medium">Priority Support</p>
          <p className="text-xs text-indigo-100">24/7 assistance</p>
        </div>
      </div>
    </motion.div>
  );
} 