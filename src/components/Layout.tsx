import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { theme } = useTheme();
  
  // Smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-surface-dark-200 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-surface-dark-200 dark:to-surface-dark-300 animate-gradient-y" />
        
        {/* Subtle gradient orbs */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary-200/10 dark:bg-primary-900/10 blur-[80px] animate-float"
          style={{ animationDelay: '0s' }}
        />
        
        <div 
          className="absolute top-[40%] -right-[5%] w-[400px] h-[400px] rounded-full bg-primary-300/5 dark:bg-primary-800/10 blur-[60px] animate-float"
          style={{ animationDelay: '-2s' }}
        />
        
        <div 
          className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] rounded-full bg-accent-300/5 dark:bg-accent-800/10 blur-[100px] animate-float"
          style={{ animationDelay: '-4s' }}
        />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-pattern-light dark:bg-pattern-dark" />
        
        {/* Fine mesh grid pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
      
      {/* Main content */}
      <Header />
      
      <AnimatePresence mode="wait">
        <motion.main 
          key={window.location.pathname}
          className="flex-grow relative z-10 pt-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <Footer />
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}