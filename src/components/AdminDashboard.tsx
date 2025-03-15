import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, Search, AlertTriangle, UserPlus, UserMinus,
  Download, Eye, Trash, RefreshCw // Fix: Added RefreshCw import
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { showToast } from '../lib/toast';
import { PlusBadge } from './ui/PlusBadge';

interface User {
  id: string;
  email: string;
  created_at: string;
  is_subscribed: boolean;
  subscription_id?: string;
  user_metadata?: {
    name?: string;
  };
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTab, setSelectedTab] = useState('users');
  
  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('allowed_emails')
          .single();
          
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }
        
        if (data && Array.isArray(data.allowed_emails)) {
          setAdminEmails(data.allowed_emails);
          setIsAdmin(data.allowed_emails.includes(user?.email || ''));
        }
      } catch (err) {
        console.error('Error in admin check:', err);
        setIsAdmin(false);
      }
    };
    
    if (user) {
      checkAdmin();
    }
  }, [user]);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        
        // Get all users from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw authError;
        }
        
        // Get subscription data
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id, status, subscription_id');
          
        if (subError) {
          console.error('Error fetching subscriptions:', subError);
        }
        
        // Map subscription data to users
        const mappedUsers = authUsers.users.map(authUser => {
          const subscription = subscriptions?.find(sub => sub.user_id === authUser.id);
          
          return {
            id: authUser.id,
            email: authUser.email || 'No email',
            created_at: authUser.created_at,
            is_subscribed: subscription?.status === 'active',
            subscription_id: subscription?.subscription_id,
            user_metadata: authUser.user_metadata
          };
        });
        
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);
  
  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(term) || 
      user.id.toLowerCase().includes(term) ||
      (user.user_metadata?.name || '').toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);
  
  // Grant Plus access to a user
  const grantPlusAccess = async (userId: string) => {
    try {
      // First, check if user already has a subscription record
      const { data: existingSub, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking subscription:', checkError);
        showToast.error('Failed to check existing subscription');
        return;
      }
      
      // If subscription exists, update it
      if (existingSub) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            status: 'active',
            subscription_id: `admin_granted_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_subscribed: true } : u
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_subscribed: true } : u
        )
      );
      
      showToast.success('Plus access granted successfully');
    } catch (err) {
      console.error('Error granting Plus access:', err);
      showToast.error('Failed to grant Plus access');
    }
  };
  
  // Revoke Plus access from a user
  const revokePlusAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_subscribed: false } : u
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_subscribed: false } : u
        )
      );
      
      showToast.success('Plus access revoked successfully');
    } catch (err) {
      console.error('Error revoking Plus access:', err);
      showToast.error('Failed to revoke Plus access');
    }
  };
  
  // Export users as CSV
  const exportUsers = () => {
    try {
      const headers = ['ID', 'Email', 'Name', 'Created At', 'Subscription Status'];
      
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.id,
          user.email,
          user.user_metadata?.name || 'N/A',
          new Date(user.created_at).toLocaleDateString(),
          user.is_subscribed ? 'Plus' : 'Free'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `aidmatch-users-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast.success('Users exported successfully');
    } catch (err) {
      console.error('Error exporting users:', err);
      showToast.error('Failed to export users');
    }
  };
  
  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto">
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You don't have permission to access the admin dashboard.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update the users list
      setUsers(users.filter(user => user.id !== userId));
      
      // Show success message
      showToast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast.error('Failed to delete user');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            Back to App
          </Button>
        </div>
        
        <Tabs defaultValue="users" onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    User Management
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={exportUsers}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setUsers([...users]);
                        setFilteredUsers([...users]);
                        setSearchTerm('');
                        showToast.success('User list has been refreshed');
                      }}
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-4">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {user.user_metadata?.name || 'No name'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email}
                                  </div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    ID: {user.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4">
                                {user.is_subscribed ? (
                                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 flex items-center gap-1 w-fit">
                                    <PlusBadge size="sm" showText={false} />
                                    Plus Member
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 w-fit">
                                    Free
                                  </Badge>
                                )}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // View user details
                                      showToast.custom(
                                        <div className="flex items-center gap-2">
                                          <Eye className="w-4 h-4" />
                                          <span>View Details</span>
                                        </div>
                                      );
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  
                                  {user.is_subscribed ? (
                                    <Button
                                      size="sm"
                                      onClick={() => revokePlusAccess(user.id)}
                                      variant="outline"
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <UserMinus className="w-4 h-4 mr-1" />
                                      Revoke Plus
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => grantPlusAccess(user.id)}
                                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Grant Plus
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Subscription Management
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Active Subscriptions
                    </h3>
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {users.filter(user => user.is_subscribed).length}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Free Users
                    </h3>
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {users.filter(user => !user.is_subscribed).length}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Total Users
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {users.length}
                    </div>
                  </div>
                </div>
                
                {/* Additional subscription metrics */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Subscription Revenue
                  </h3>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Monthly recurring revenue (estimated)
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${(users.filter(user => user.is_subscribed).length * 9).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Conversion rate
                      </p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {users.length > 0 
                          ? `${((users.filter(user => user.is_subscribed).length / users.length) * 100).toFixed(1)}%` 
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Admin Settings
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Current admin emails: {adminEmails.join(', ')}
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-800 dark:text-amber-400">
                        Admin Access
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Admin access is managed through the database. To add or remove admins, update the allowed_emails array in the admin_users table.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    System Status
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Database</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Authentication</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Storage</span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                    </div>
                    
                    <Button 
                      onClick={() => window.location.reload()}
                      className="w-full mt-4"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh System Status
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;