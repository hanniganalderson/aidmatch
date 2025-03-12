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
  
  // Animation variants
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  
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

  // Handle Upgrade
  const handleUpgrade = async () => {
    try {
      if (!user?.email) {
        navigate('/signin');
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
    if (!subscription?.current_period_end) return 'Unknown';
    
    const date = new Date(subscription.current_period_end * 1000);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-800 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-100/20 dark:bg-indigo-900/10 blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-2xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* Sidebar */}
              <div className="md:col-span-1 bg-gray-50 dark:bg-gray-800/50 p-6 border-r border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === 'account' 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <User className={`w-5 h-5 mr-3 ${
                      activeTab === 'account' 
                        ? 'text-indigo-500 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Account
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === 'security' 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <Lock className={`w-5 h-5 mr-3 ${
                      activeTab === 'security' 
                        ? 'text-indigo-500 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Security
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === 'notifications' 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <Bell className={`w-5 h-5 mr-3 ${
                      activeTab === 'notifications' 
                        ? 'text-indigo-500 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Notifications
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('subscription')}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === 'subscription' 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-500' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 mr-3 ${
                      activeTab === 'subscription' 
                        ? 'text-indigo-500 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Subscription
                  </button>
                </div>
              </div>
              
              {/* Main content */}
              <div className="md:col-span-3 p-6">
                <AnimatePresence mode="wait">
                  {/* Account Tab */}
                  {activeTab === 'account' && (
                    <motion.div
                      key="account"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-6">
                        <div className="relative">
                          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Account Settings
                          </h2>
                        </div>
                        
                        {/* Account settings content */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Your name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="you@example.com"
                              disabled
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Your email address cannot be changed
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                              saved 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                            }`}
                          >
                            {saving ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Saving...
                              </div>
                            ) : saved ? (
                              <div className="flex items-center">
                                <Check className="w-4 h-4 mr-2" />
                                Saved
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderSectionTitle(Shield, 'Security Settings')}
                      
                      <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                          <Label htmlFor="currentPassword" className="block mb-2">Current Password</Label>
                          <Input 
                            id="currentPassword" 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="newPassword" className="block mb-2">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword" className="block mb-2">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        {passwordError && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{passwordError}</span>
                          </div>
                        )}
                        
                        <div>
                          <Button 
                            type="submit"
                            disabled={saving}
                            className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                              saving 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {saving ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Updating...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Lock className="w-4 h-4 mr-2" />
                                Update Password
                              </div>
                            )}
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                  
                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderSectionTitle(Bell, 'Notification Preferences')}
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Scholarships</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get notified when new scholarships match your profile
                            </p>
                          </div>
                          <Switch 
                            checked={newScholarships} 
                            onCheckedChange={setNewScholarships}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Deadline Reminders</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Receive reminders before scholarship deadlines
                            </p>
                          </div>
                          <Switch 
                            checked={deadlineReminders} 
                            onCheckedChange={setDeadlineReminders}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Application Updates</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Get updates on your scholarship applications
                            </p>
                          </div>
                          <Switch 
                            checked={applicationUpdates} 
                            onCheckedChange={setApplicationUpdates}
                          />
                        </div>
                        
                        <div>
                          <Button 
                            onClick={handleSave}
                            disabled={saving}
                            className={`px-6 py-2 rounded-xl transition-all duration-200 ${
                              saved 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                            }`}
                          >
                            {saving ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Saving...
                              </div>
                            ) : saved ? (
                              <div className="flex items-center">
                                <Check className="w-4 h-4 mr-2" />
                                Saved
                              </div>
                            ) : (
                              'Save Preferences'
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Subscription Tab */}
                  {activeTab === 'subscription' && (
                    <motion.div
                      key="subscription"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderSectionTitle(CreditCard, 'Subscription Management')}
                      
                      <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {isSubscribed ? 'AidMatch Plus' : 'Free Plan'}
                              </h3>
                              {isSubscribed && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Renews on {formatNextBillingDate()}
                                </p>
                              )}
                            </div>
                            
                            {isSubscribed ? (
                              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                Free
                              </Badge>
                            )}
                          </div>
                          
                          {isSubscribed ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Unlimited scholarship saves</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>AI essay assistance</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Auto-fill applications</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Priority support</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Basic scholarship search</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Save up to 3 scholarships</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 line-through">
                                <Lock className="w-4 h-4" />
                                <span>AI essay assistance</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 line-through">
                                <Lock className="w-4 h-4" />
                                <span>Auto-fill applications</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {isSubscribed ? (
                          <div className="space-y-3">
                            <Button 
                              onClick={() => navigate('/account/billing')}
                              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Manage Billing
                            </Button>
                            
                            <div className="flex items-center justify-between">
                              <Button 
                                onClick={handleSyncSubscription}
                                disabled={syncing}
                                variant="outline"
                                className="relative"
                              >
                                {syncing ? (
                                  <>
                                    <span className="opacity-0">Sync Subscription</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  </>
                                ) : syncSuccess ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    Synced!
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Sync Status
                                  </>
                                )}
                              </Button>
                              
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last updated: {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Button 
                              onClick={handleUpgrade}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Upgrade to Plus
                            </Button>
                            
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                              Get unlimited access to all premium features for just $9/month
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}