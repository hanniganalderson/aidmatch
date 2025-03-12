import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../api/checkout';

interface CheckoutButtonProps {
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
  showDiagnosticOnError?: boolean;
}

export function CheckoutButton({ 
  size = 'default', 
  variant = 'default',
  showDiagnosticOnError = false
}: CheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    setDiagnostics([]);
    
    try {
      const { url } = await createCheckoutSession({
        email: user?.email || '',
        subscriptionType: 'plus',
        onDiagnostic: (message) => {
          setDiagnostics((prev) => [...prev, message]);
        }
      });
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        size={size}
        variant={variant}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Upgrade to Plus
      </Button>
      
      {error && showDiagnosticOnError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          <p className="font-medium">Error: {error}</p>
          {diagnostics.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Diagnostics:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {diagnostics.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 