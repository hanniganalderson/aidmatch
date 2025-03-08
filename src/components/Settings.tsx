import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, User, Lock, Bell, Moon, Sun, Trash2, LogOut, Check, 
  AlertCircle, Settings as SettingsIcon, Shield, Sparkles, ArrowRight,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useInView } from 'react-intersection-observer';

export function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
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

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

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

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-indigo-950/10 dark:to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(29,78,216,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(29,78,216,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 px-4 py-2 rounded-full mb-4">
              <SettingsIcon className="w-4 h-4" />
              <span className="font-medium">Personalize Your Experience</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Account Settings
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Customize your account preferences, security options, and notification settings.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl"
          >
            {/* Tab navigation with animated indicator */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 relative overflow-x-auto">
              <button
                onClick={() => setActiveTab('account')}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'account' 
                    ? 'text-primary-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
                {activeTab === 'account' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'security' 
                    ? 'text-primary-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                Security
                {activeTab === 'security' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'notifications' 
                    ? 'text-primary-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
                {activeTab === 'notifications' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'appearance' 
                    ? 'text-primary-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Appearance
                {activeTab === 'appearance' && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
                  />
                )}
              </button>
            </div>
            
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {renderSectionTitle(User, "Profile Information")}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            value={email}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all cursor-not-allowed"
                            disabled
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            Verified
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          To change your email, please contact support
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-all duration-300 ${
                          saved 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-primary-500/20 hover:shadow-xl'
                        }`}
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : saved ? (
                          <>
                            <Check className="w-4 h-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {renderSectionTitle(Lock, "Security Settings")}
                    
                    <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 p-6 space-y-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Strong passwords help protect your account from unauthorized access
                          </p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <label htmlFor="current-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              New Password
                            </label>
                            <input
                              type="password"
                              id="new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              id="confirm-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-all"
                              placeholder="••••••••"
                              required
                            />
                          </div>
                        </div>
                        
                        {passwordError && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{passwordError}</span>
                          </motion.div>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02, translateY: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={saving}
                          className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg mt-4 transition-all duration-300 ${
                            saved 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-primary-500/20 hover:shadow-xl'
                          }`}
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : saved ? (
                            <>
                              <Check className="w-4 h-4" />
                              Password Updated!
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Update Password
                            </>
                          )}
                        </motion.button>
                      </form>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50/50 to-red-50/30 dark:from-red-900/10 dark:to-red-900/5 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
                      <div className="flex items-start gap-3">
                        <Trash2 className="w-5 h-5 text-red-500 mt-1" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Deletion</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            This will permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          
                          <motion.button
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2.5 bg-white dark:bg-white/5 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {renderSectionTitle(Bell, "Notification Preferences")}
                    
                    <div className="space-y-6">
                      <motion.div 
                        className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/30 transition-all shadow-sm hover:shadow"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mt-1">
                              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Scholarship Alerts</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get notified when new scholarships matching your profile are added to the platform
                              </p>
                            </div>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={newScholarships}
                              onChange={() => setNewScholarships(!newScholarships)}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
                          </label>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/30 transition-all shadow-sm hover:shadow"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg mt-1">
                              <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Deadline Reminders</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receive reminders when scholarship deadlines are approaching
                              </p>
                            </div>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={deadlineReminders}
                              onChange={() => setDeadlineReminders(!deadlineReminders)}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
                          </label>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/30 transition-all shadow-sm hover:shadow"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-1">
                              <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Application Updates</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Stay informed about your scholarship application status
                              </p>
                            </div>
                          </div>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={applicationUpdates}
                              onChange={() => setApplicationUpdates(!applicationUpdates)}
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-accent-500"></div>
                          </label>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-all duration-300 ${
                          saved 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-primary-500/20 hover:shadow-xl'
                        }`}
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : saved ? (
                          <>
                            <Check className="w-4 h-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Preferences
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {renderSectionTitle(theme === 'dark' ? Moon : Sun, "Visual Preferences")}
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Choose Theme</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.button
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => theme !== 'light' && toggleTheme()}
                          className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                            theme === 'light'
                              ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/10'
                              : 'hover:shadow-md'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-20"></div>
                          <div className="relative p-6 flex flex-col items-center">
                            <div className="w-full h-32 bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
                              <div className="h-6 bg-blue-50 border-b border-gray-200 flex items-center px-3">
                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                              </div>
                              <div className="p-3">
                                <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                                <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                                <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                                <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                              </div>
                            </div>
                            
                            <div className="w-full flex items-center justify-between">
                              <span className="font-medium text-gray-900">Light Theme</span>
                              {theme === 'light' && (
                                <div className="flex items-center gap-1.5 text-primary-500 bg-primary-100 px-2 py-1 rounded-full text-xs font-medium">
                                  <Check className="w-3 h-3" />
                                  Active
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => theme !== 'dark' && toggleTheme()}
                          className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                            theme === 'dark'
                              ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/10'
                              : 'hover:shadow-md'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-indigo-950 opacity-20"></div>
                          <div className="relative p-6 flex flex-col items-center">
                            <div className="w-full h-32 bg-gray-900 rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-700">
                              <div className="h-6 bg-gray-800 border-b border-gray-700 flex items-center px-3">
                                <div className="w-2 h-2 rounded-full bg-gray-600 mr-1"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-600 mr-1"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                              </div>
                              <div className="p-3">
                                <div className="h-2 w-16 bg-gray-700 rounded mb-2"></div>
                                <div className="h-2 w-full bg-gray-800 rounded mb-2"></div>
                                <div className="h-2 w-full bg-gray-800 rounded mb-2"></div>
                                <div className="h-2 w-3/4 bg-gray-800 rounded"></div>
                              </div>
                            </div>
                            
                            <div className="w-full flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">Dark Theme</span>
                              {theme === 'dark' && (
                                <div className="flex items-center gap-1.5 text-primary-500 bg-primary-900/30 px-2 py-1 rounded-full text-xs font-medium">
                                  <Check className="w-3 h-3" />
                                  Active
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      </div>
                      
                      <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-900/30">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mt-1">
                            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Theme Preference</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Your theme preference is saved and will be remembered the next time you visit.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              }
                </AnimatePresence>
            </div>
            
            {/* Sign out option at the bottom */}
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={name || 'User'} 
                      className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {email}
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}