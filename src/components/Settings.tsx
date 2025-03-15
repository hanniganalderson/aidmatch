// src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, Check, 
  AlertCircle, Shield, Sparkles,
  CreditCard, Crown, RefreshCw,
  Moon, Sun, LogOut, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { createCheckoutSession } from '../lib/subscriptionService';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

export function Settings() {
  const { user, signOut, updateUserProfile, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isSubscribed, refreshSubscription, subscriptionData } = useSubscription();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
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
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Define tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'account', label: 'Account', icon: Trash2 },
  ];

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        // Update state with fetched data
        if (data) {
          // Set any additional profile data here
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleUpgrade = async () => {
    try {
      if (!user?.email) {
        navigate('/signin');
        return;
      }
      navigate('/plus');
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });
      
      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    setSaving(true);
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        displayName: name,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <Card variant="bordered">
              {activeTab === 'profile' && (
                <>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={email}
                            disabled
                            className="mt-1 bg-gray-50 dark:bg-gray-700"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3">
                    <Button onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                  </CardFooter>
                </>
              )}
              
              {activeTab === 'notifications' && (
                <>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about new scholarships</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Deadline Reminders</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get notified before scholarship deadlines</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Marketing Updates</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive news and promotional offers</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
              
              {activeTab === 'privacy' && (
                <>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Data Collection</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Allow us to collect usage data to improve your experience</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Third-Party Sharing</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Share your data with trusted partners</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
              
              {activeTab === 'password' && (
                <>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="mt-1" />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button className="ml-auto">Update Password</Button>
                  </CardFooter>
                </>
              )}
              
              {activeTab === 'account' && (
                <>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Delete Account</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        
                        {!deleteConfirm ? (
                          <Button 
                            variant="destructive" 
                            onClick={() => setDeleteConfirm(true)}
                          >
                            Delete Account
                          </Button>
                        ) : (
                          <div className="p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50 dark:bg-red-900/20">
                            <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                              Are you sure you want to delete your account? This will erase all your data and cannot be reversed.
                            </p>
                            <div className="flex gap-3">
                              <Button 
                                variant="destructive" 
                                onClick={deleteAccount}
                              >
                                Yes, Delete My Account
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setDeleteConfirm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}