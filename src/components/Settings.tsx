// src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, User, Lock, Bell, Moon, Sun, Trash2, LogOut, Check, 
  AlertCircle, Settings as SettingsIcon, Shield, Sparkles, ArrowRight,
  LucideIcon, CreditCard, Crown, RefreshCw, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlusBadge } from './ui/PlusBadge';
import { useInView } from 'react-intersection-observer';
// Import checkout function for upgrading
import { createCheckoutSession } from '../lib/subscriptionService';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

export function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSubscribed, subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  // Account settings
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Notification settings
  const [newScholarships, setNewScholarships] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  
  // Password reset
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Animation states
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
  useEffect(() => {
    // (No changes here)
  }, []);

  // New: Handle Upgrade - if user is not signed in, redirect them to sign in; if signed in, initiate checkout.
  const handleUpgrade = async () => {
    try {
      if (!user?.email) {
        navigate('/signin'); // Change this to your sign-in route if needed.
        return;
      }
      await createCheckoutSession(user.email);
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };
  
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    }, 1000);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSyncSubscription = async () => {
    try {
      setSyncing(true);
      await refreshSubscription();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (error) {
      console.error('Error syncing subscription status:', error);
    } finally {
      setSyncing(false);
    }
  };

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

  // Render a styled section title
  const renderSectionTitle = (icon: LucideIcon, title: string) => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-500/20 dark:via-primary-500/10 dark:to-transparent rounded-lg border-l-4 border-primary-500 mb-6">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
          <Icon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
    );
  };

  // Format next billing date
  const formatNextBillingDate = () => {
    if (!subscription?.updated_at) return 'Unknown';
    
    const lastUpdated = new Date(subscription.updated_at);
    const nextBilling = new Date(lastUpdated);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    
    return nextBilling.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Account Settings</h1>
          
          <div className="bg-white dark:bg-gray-800/90 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/30 overflow-hidden">
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/30">
              <h2 className="text-xl font-medium mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block mb-1">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="block mb-1">Email Address</Label>
                  <Input 
                    id="email" 
                    value={email} 
                    disabled 
                    className="w-full bg-gray-50 dark:bg-gray-700/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
              
              <Button 
                onClick={handleSave}
                className="mt-6 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
              >
                Save Changes
              </Button>
            </div>
            
            {/* Subscription Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/30">
              <h2 className="text-xl font-medium mb-4">Subscription</h2>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {isSubscribed ? 'AidMatch Plus' : 'Free Plan'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isSubscribed 
                        ? `Renews on ${formatNextBillingDate()}` 
                        : 'Limited features'}
                    </p>
                  </div>
                  
                  {isSubscribed ? (
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      Free
                    </Badge>
                  )}
                </div>
              </div>
              
              {isSubscribed ? (
                <Button 
                  onClick={() => navigate('/account/billing')}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                >
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/plus')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  Upgrade to Plus
                </Button>
              )}
            </div>
            
            {/* Preferences Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/30">
              <h2 className="text-xl font-medium mb-4">Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => toggleTheme()}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about new scholarships
                    </p>
                  </div>
                  <Switch 
                    checked={newScholarships} 
                    onCheckedChange={(checked) => setNewScholarships(checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div className="p-6 bg-red-50/50 dark:bg-red-900/10">
              <h2 className="text-xl font-medium mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
              
              <Button 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
              
              <Button 
                variant="outline"
                className="ml-4 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleSignOut}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}