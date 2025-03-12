import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../api/checkout';
import { Button } from './ui/button';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showDiagnosticOnError?: boolean;
}

export function CheckoutButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  showDiagnosticOnError = false
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  const handleCheckout = async () => {
    if (!user?.email) {
      setError('Please sign in to continue');
      return;
    }
    
    setLoading(true);
    setError(null);
    setDiagnosticLogs([]);
    
    try {
      const result = await createCheckoutSession({
        email: user.email,
        subscriptionType: 'plus',
        onSuccess: (url) => {
          // Redirect to Stripe checkout
          window.location.href = url;
        },
        onError: (err) => {
          console.error('Checkout error:', err);
          setError('Failed to start checkout process. Please try again.');
          if (showDiagnosticOnError) {
            setShowDiagnostic(true);
          }
        },
        onDiagnostic: (message) => {
          setDiagnosticLogs(prev => [...prev, message]);
        }
      });
      
      // If we get here without a redirect, something went wrong
      if (!result?.url) {
        throw new Error('No checkout URL returned');
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred. Please try again later.');
      if (showDiagnosticOnError) {
        setShowDiagnostic(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        variant={variant}
        size={size}
        className={`${className} ${variant === 'default' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90' : ''}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Upgrade to Plus
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            {showDiagnosticOnError && (
              <button 
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="text-indigo-500 hover:underline text-xs mt-1"
              >
                {showDiagnostic ? 'Hide diagnostic info' : 'Show diagnostic info'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {showDiagnostic && diagnosticLogs.length > 0 && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono max-h-40 overflow-y-auto">
          {diagnosticLogs.map((log, i) => (
            <div key={i} className="text-gray-700 dark:text-gray-300">{log}</div>
          ))}
        </div>
      )}
    </div>
  );
} 