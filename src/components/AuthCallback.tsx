import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Parse the URL for error information
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      const errorInHash = hashParams.get('error');
      const errorInQuery = queryParams.get('error');
      
      if (errorInHash || errorInQuery) {
        console.error('Auth callback error:', errorInHash || errorInQuery);
        console.error('Error description:', hashParams.get('error_description') || queryParams.get('error_description'));
        navigate('/signin?error=oauth-failed');
        return;
      }
      
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          navigate('/dashboard');
        } else {
          navigate('/signin');
        }
      } catch (err) {
        console.error('Error getting session:', err);
        navigate('/signin?error=session-error');
      }
    };
    
    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Completing sign in...</p>
    </div>
  );
}