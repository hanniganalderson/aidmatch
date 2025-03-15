import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface PageBackgroundProps {
  variant?: 'default' | 'gradient' | 'subtle';
  children: React.ReactNode;
}

export function PageBackground({ 
  variant = 'default', 
  children 
}: PageBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="min-h-screen relative">
      {/* Base background */}
      <div className={`fixed inset-0 ${
        isDark 
          ? 'bg-gray-950' 
          : 'bg-gray-50'
      } transition-colors duration-300`} />
      
      {/* Gradient overlay based on variant */}
      {variant === 'gradient' && (
        <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-indigo-950/10 to-gray-950 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-gray-950" />
      )}
      
      {variant === 'default' && (
        <div className="fixed inset-0 bg-gradient-to-b from-purple-950/10 to-gray-950/0 dark:from-purple-950/20 dark:to-gray-950/0" />
      )}
      
      {/* Animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Purple orb */}
        <motion.div 
          className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[80px]"
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20,
            ease: "easeInOut" 
          }}
        />
        
        {/* Indigo orb */}
        <motion.div 
          className="absolute bottom-[10%] -left-[5%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-[70px]"
          animate={{ 
            y: [0, 40, 0],
            x: [0, -20, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 25,
            ease: "easeInOut" 
          }}
        />
        
        {/* Green accent orb - smaller and more subtle */}
        <motion.div 
          className="absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-emerald-600/3 dark:bg-emerald-600/5 blur-[60px]"
          animate={{ 
            y: [0, 30, 0],
            x: [0, -15, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 15,
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(120,87,255,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(120,87,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 