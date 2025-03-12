import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SimpleCheckoutButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simple direct fetch to the API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email || 'test@example.com',
          subscriptionType: 'plus'
        }),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Redirect to Stripe
      window.location.href = data.url;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 text-white"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Upgrade to Plus
      </Button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
    </div>
  );
} 