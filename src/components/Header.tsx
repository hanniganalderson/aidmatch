// src/components/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LayoutDashboard, Menu, X, Moon, Sun, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlusBadge } from './ui/PlusBadge';

export function Header() {
  const { user, signOut, getUserDisplayName } = useAuth();
  const { isSubscribed } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [displayName, setDisplayName] = useState('');

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
  }, [location]);

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
          ? 'py-2 bg-gray-950 text-white shadow-md backdrop-blur-md border-b border-gray-800'
          : 'py-4 bg-gray-950 text-white'
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
                <path 
                  d="M18,11 L18,19 M15.5,13 C15.5,11.5 20.5,11.5 20.5,13 C20.5,15 15.5,15 15.5,17 C15.5,18.5 20.5,18.5 20.5,17" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h1 className="text-2xl font-bold tracking-tight text-white">
                AidMatch
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center mr-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href ||
                    location.pathname.startsWith(item.href + '/')
                      ? 'text-primary-400'
                      : 'text-gray-300 hover:text-primary-400 hover:bg-gray-800/50'
                  }`}
                >
                  {location.pathname === item.href && (
                    <motion.span
                      className="absolute inset-0 rounded-lg bg-primary-900/20 -z-10"
                      layoutId="activeNav"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-gray-800 transition-colors"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/settings"
              className="p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-gray-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 ml-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center overflow-hidden text-sm font-medium">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">
                      {displayName || 'User'}
                    </span>
                    {isSubscribed && <PlusBadge size="sm" />}
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={menuAnimation}
                      className="absolute right-0 mt-2 w-60 rounded-lg bg-gray-900 shadow-lg border border-gray-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">
                            Hi, {displayName || 'User'}
                          </p>
                          {isSubscribed && <PlusBadge size="sm" />}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
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
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`block px-4 py-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'text-primary-400 bg-gray-700'
                        : 'text-gray-300 hover:text-primary-400 hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
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