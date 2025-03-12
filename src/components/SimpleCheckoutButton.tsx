import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SimpleCheckoutButton() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    addLog('Starting checkout process...');
    
    try {
      // Simple direct fetch to the API
      addLog(`Sending request to /api/create-checkout-session`);
      
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
      
      addLog(`Response status: ${response.status}`);
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        
        addLog(`Error response: ${errorText}`);
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      addLog(`Success! Redirecting to: ${data.url}`);
      
      // Redirect to Stripe
      window.location.href = data.url;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(`Error: ${errorMessage}`);
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
        Simple Checkout Test
      </Button>
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono max-h-60 overflow-y-auto">
          <p className="font-medium mb-2">Logs:</p>
          {logs.map((log, i) => (
            <div key={i} className="text-xs">{log}</div>
          ))}
        </div>
      )}
    </div>
  );
} 