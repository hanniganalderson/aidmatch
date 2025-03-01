import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-surface-300 dark:to-surface-400 text-gray-900 dark:text-white transition-colors duration-300">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-grid" />
          <div className="absolute -top-[30rem] -left-[30rem] w-[60rem] h-[60rem] rounded-full bg-blue-600 opacity-5 blur-[128px]" />
          <div className="absolute -bottom-[30rem] -right-[30rem] w-[60rem] h-[60rem] rounded-full bg-indigo-600 opacity-5 blur-[128px]" />
          <div className="absolute inset-0 bg-noise" />
        </div>
        
        <Header />
        
        <main className="flex-grow relative z-10">
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}