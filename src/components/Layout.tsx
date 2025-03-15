import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { MinimalistFooter } from './MinimalistFooter';
import { PageBackground } from './PageBackground';

interface LayoutProps {
  children: React.ReactNode;
  backgroundVariant?: 'default' | 'gradient' | 'subtle';
}

export function Layout({ children, backgroundVariant = 'default' }: LayoutProps) {
  // Add smooth scrolling effect
  useEffect(() => {
    // Hide scrollbar but keep functionality
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const style = document.createElement('style');
    style.textContent = `
      body::-webkit-scrollbar {
        width: 0px;
      }
      body {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <PageBackground variant={backgroundVariant}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16 pb-16">
          {children}
        </main>
        <MinimalistFooter />
      </div>
    </PageBackground>
  );
}