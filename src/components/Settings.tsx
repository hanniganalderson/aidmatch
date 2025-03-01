import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Lock, Bell, Moon, Sun, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export function Settings() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);
  
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    
    // Here you would call your auth service to reset the password
    // For now, we'll just simulate success
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 3000);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
          
          <div className="bg-white dark:bg-[#171923]/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-[#2A2D3A] overflow-hidden shadow-xl">
            <div className="flex border-b border-gray-200 dark:border-[#2A2D3A] overflow-x-auto">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-gray-100 dark:bg-[#2A2D3A] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Account
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-gray-100 dark:bg-[#2A2D3A] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-gray-100 dark:bg-[#2A2D3A] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'appearance' 
                    ? 'bg-gray-100 dark:bg-[#2A2D3A] text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Appearance
              </button>
            </div>
            
            <div className="p-8">
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">To change your email, please contact support.</p>
                  </div>
                  
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {saved ? 'Saved!' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                  
                  <div className="bg-gray-50 dark:bg-[#1A1E2A] rounded-lg border border-gray-200 dark:border-[#2A2D3A] p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reset Password</h3>
                    
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="input-field"
                          placeholder="Enter your current password"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field"
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="input-field"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                      
                      {passwordError && (
                        <p className="text-red-500 text-sm">{passwordError}</p>
                      )}
                      
                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                        >
                          <Save className="w-4 h-4" />
                          {saved ? 'Password Updated!' : 'Update Password'}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-[#1A1E2A] rounded-lg border border-gray-200 dark:border-[#2A2D3A] p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Account</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </motion.button>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Scholarship Alerts</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get notified when new scholarships matching your profile are added
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={newScholarships}
                          onChange={() => setNewScholarships(!newScholarships)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Deadline Reminders</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive reminders about upcoming scholarship deadlines
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={deadlineReminders}
                          onChange={() => setDeadlineReminders(!deadlineReminders)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Application Updates</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get updates about your scholarship applications
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={applicationUpdates}
                          onChange={() => setApplicationUpdates(!applicationUpdates)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="px-6 py-3 bg-black dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {saved ? 'Saved!' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>
              )}
              
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Appearance Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => theme !== 'light' && toggleTheme()}
                          className={`p-4 rounded-lg border ${
                            theme === 'light'
                              ? 'border-blue-500 ring-2 ring-blue-500/50'
                              : 'border-gray-200 dark:border-[#2A2D3A]'
                          } transition-all duration-200`}
                        >
                          <div className="bg-white rounded-md p-4 shadow-sm mb-3">
                            <div className="h-2 w-8 bg-gray-300 rounded mb-2"></div>
                            <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 w-12 bg-gray-200 rounded"></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-medium">Light</span>
                            {theme === 'light' && (
                              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </button>
                        
                        <button
                          onClick={() => theme !== 'dark' && toggleTheme()}
                          className={`p-4 rounded-lg border ${
                            theme === 'dark'
                              ? 'border-blue-500 ring-2 ring-blue-500/50'
                              : 'border-gray-200 dark:border-[#2A2D3A]'
                          } transition-all duration-200`}
                        >
                          <div className="bg-gray-900 rounded-md p-4 shadow-sm mb-3">
                            <div className="h-2 w-8 bg-gray-700 rounded mb-2"></div>
                            <div className="h-2 w-16 bg-gray-800 rounded mb-2"></div>
                            <div className="h-2 w-12 bg-gray-800 rounded"></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white font-medium">Dark</span>
                            {theme === 'dark' && (
                              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}