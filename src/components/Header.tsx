// src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LayoutDashboard, Menu, X, Moon, Sun, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlusBadge } from './ui/PlusBadge';
import { Button } from './ui/button';

export function Header() {
  const { user, signOut, getUserDisplayName } = useAuth();
  const { isSubscribed } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Update displayName when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(getUserDisplayName());
    } else {
      setDisplayName('');
    }
  }, [user, getUserDisplayName]);

  // Update header styling on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { label: 'Match', href: '/questionnaire', description: 'Find scholarships' },
    { label: 'Plus', href: '/plus', description: 'Plans & pricing' },
    { label: 'About', href: '/about', description: 'About AidMatch' },
  ];

  // Animation variants for menus
  const menuAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Close the user menu after signing out
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-2 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/50 text-white'
          : 'py-4 bg-transparent text-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Graduation cap with dollar sign */}
              <svg 
                viewBox="0 0 36 36" 
                className="w-full h-full" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" /> {/* Primary green */}
                    <stop offset="100%" stopColor="#0EA5E9" /> {/* Blue accent */}
                  </linearGradient>
                </defs>
                
                {/* Graduation cap shape */}
                <path 
                  d="M18,4 L4,12 L18,20 L32,12 L18,4 Z" 
                  fill="url(#logoGradient)"
                />
                
                {/* Cap bottom */}
                <path 
                  d="M25,12 L25,22 C25,24.5 22,27 18,27 C14,27 11,24.5 11,22 L11,12"
                  fill="url(#logoGradient)"
                  strokeLinejoin="round"
                />
                
                {/* Tassel */}
                <path 
                  d="M25,12 C27,14.5 27,19 25,22" 
                  stroke="#0EA5E9" 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round"
                />
                
                {/* Dollar sign */}
                <text 
                  x="18" 
                  y="16" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fill="white" 
                  fontSize="10" 
                  fontWeight="bold"
                >
                  $
                </text>
              </svg>
            </motion.div>
            <span className="text-lg font-bold tracking-tight text-white">AidMatch</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center mr-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  icon={item.label === 'Plus' ? <Crown className="w-4 h-4 text-primary-400" /> : undefined}
                />
              ))}
            </nav>

            {/* User actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Dashboard link */}
              <Link
                to="/dashboard"
                className="p-2 rounded-full text-gray-300 hover:bg-gray-800/50 transition-colors"
                aria-label="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-300 hover:bg-gray-800/50 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Settings button */}
              <Link
                to="/settings"
                className="p-2 rounded-full text-gray-300 hover:bg-gray-800/50 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              
              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                      {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">
                      {displayName || 'User'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 py-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-800">
                          <p className="text-sm font-medium text-white">
                            Hi, {displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user?.email || ''}
                          </p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          {isSubscribed && (
                            <Link
                              to="/account/billing"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                              <Crown className="w-4 h-4 text-amber-400" />
                              Manage Subscription
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/signin"
                    className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-primary-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-300 hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to="/dashboard"
              className="p-2 rounded-full text-gray-300 hover:bg-gray-800 transition-colors"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            {isSubscribed && (
              <div className="flex items-center">
                <PlusBadge size="sm" />
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden mt-2"
            >
              <div className="py-2 space-y-1 bg-gray-900 rounded-lg shadow-lg">
                {navItems.map((item) => (
                  <MobileNavLink
                    key={item.href}
                    to={item.href}
                    label={item.label}
                    icon={item.label === 'Plus' ? <Crown className="w-4 h-4 text-primary-400" /> : undefined}
                  />
                ))}
                {user ? (
                  <>
                    <div className="px-4 py-3 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          Hi, {displayName || 'User'}
                        </p>
                        {isSubscribed && <PlusBadge size="sm" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email || ''}
                      </p>
                    </div>
                    {isSubscribed && (
                      <Link
                        to="/account/billing"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        Manage Subscription
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/signin"
                      className="block px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary-400 hover:bg-gray-700"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="block mx-4 mt-2 px-4 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:opacity-90 rounded-lg transition-colors"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Desktop Navigation Link
function NavLink({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? 'text-white bg-primary-900/50' 
          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        {label}
      </div>
    </Link>
  );
}

// Mobile Navigation Link
function MobileNavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
        isActive 
          ? 'bg-primary-900/50 text-white' 
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}