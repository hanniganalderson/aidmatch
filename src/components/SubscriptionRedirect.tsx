import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '../components/ui/use-toast';

export function SubscriptionRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription, handleSubscriptionChange } = useSubscription();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your subscription...');
  
  useEffect(() => {
    const processSubscription = async () => {
      try {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        const sessionId = searchParams.get('session_id');
        
        if (success === 'true' && sessionId) {
          // Verify the session with your backend
          const response = await fetch(`/api/verify-subscription?session_id=${sessionId}`);
          const data = await response.json();
          
          if (data.status === 'active') {
            handleSubscriptionChange('active');
            setStatus('success');
            setMessage('Your subscription has been activated successfully!');
            
            // Redirect to success page after a delay
            setTimeout(() => {
              navigate('/subscription-success');
            }, 2000);
          } else {
            throw new Error('Subscription verification failed');
          }
        } else if (canceled === 'true') {
          setStatus('error');
          setMessage('Your subscription process was canceled.');
          
          // Redirect to dashboard after a delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // Refresh subscription status from the database
          await refreshSubscription();
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error processing subscription:', error);
        setStatus('error');
        setMessage('There was an error processing your subscription. Please try again or contact support.');
        
        toast({
          title: 'Subscription Error',
          description: 'There was a problem with your subscription. Please try again or contact support.',
          variant: 'destructive'
        });
      }
    };
    
    processSubscription();
  }, [searchParams, navigate, refreshSubscription, handleSubscriptionChange]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing
            </h1>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Success!
            </h1>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Subscription Canceled
            </h1>
          </>
        )}
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className="w-full"
          variant={status === 'error' ? 'outline' : 'default'}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
} 