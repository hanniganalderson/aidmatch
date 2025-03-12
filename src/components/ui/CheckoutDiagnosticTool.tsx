import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface DiagnosticLogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export function CheckoutDiagnosticTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<DiagnosticLogEntry[]>([]);
  const [email, setEmail] = useState('');
  
  const addLogEntry = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    setLog(prev => [...prev, { timestamp, message, type }]);
  };
  
  const clearLog = () => {
    setLog([]);
  };
  
  const copyLogToClipboard = () => {
    const logText = log.map(entry => `${entry.timestamp}: ${entry.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    addLogEntry('Log copied to clipboard', 'success');
  };
  
  const testEndpoint = async (url: string) => {
    addLogEntry(`🔍 Trying endpoint: ${url}`);
    
    try {
      const cacheBuster = Date.now();
      addLogEntry(`📤 Sending POST request to ${url}?cb=${cacheBuster}...`);
      
      const response = await fetch(`${url}?cb=${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          subscriptionType: 'plus'
        })
      });
      
      addLogEntry(`📥 Response from ${url}: ${response.status} ${response.statusText}`);
      
      // Log response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      addLogEntry(`Response headers: ${JSON.stringify(headers)}`);
      
      if (!response.ok) {
        addLogEntry(`❌ ${response.status} ${response.statusText} for ${url}, will try next endpoint`, 'error');
        return false;
      }
      
      // Try to parse response body
      addLogEntry(`📄 Attempting to read response body...`);
      const text = await response.text();
      addLogEntry(`Response body (first 200 chars): ${text.substring(0, 200)}`);
      
      try {
        const json = JSON.parse(text);
        addLogEntry(`✅ Valid JSON response received with keys: ${Object.keys(json).join(', ')}`, 'success');
        
        if (json.url) {
          addLogEntry(`🎉 SUCCESS: Checkout URL found: ${json.url.substring(0, 30)}...`, 'success');
          return true;
        } else {
          addLogEntry(`⚠️ Response doesn't contain checkout URL`, 'error');
          return false;
        }
      } catch (e) {
        addLogEntry(`❌ Failed to parse JSON: ${e instanceof Error ? e.message : String(e)}`, 'error');
        return false;
      }
    } catch (error) {
      addLogEntry(`❌ Network error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return false;
    }
  };
  
  const runDiagnostic = async () => {
    if (!email) {
      addLogEntry('❌ Please enter an email address', 'error');
      return;
    }
    
    setIsRunning(true);
    clearLog();
    
    addLogEntry('🚀 Starting checkout diagnostic...');
    addLogEntry(`📧 Email: ${email}`);
    
    // Environment info
    addLogEntry('🌐 Environment check:');
    addLogEntry(`URL: ${window.location.href}`);
    addLogEntry(`User Agent: ${navigator.userAgent}`);
    
    // Test server connectivity
    addLogEntry('🔄 Testing server connectivity...');
    try {
      const pingResponse = await fetch('/api/ping');
      addLogEntry(`Ping response: ${pingResponse.status} ${pingResponse.statusText}`);
    } catch (error) {
      addLogEntry(`❌ Server connectivity test failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
    
    // Try different endpoints
    const endpoints = [
      '/api/create-checkout-session',
      '/.netlify/functions/create-checkout-session',
      '/supabase/functions/create-checkout-session',
      '/stripe/create-checkout-session',
      '/functions/create-checkout-session',
      `${window.location.origin}/api/create-checkout-session`,
      '/create-checkout-session',
      '/checkout'
    ];
    
    addLogEntry(`📝 Will try ${endpoints.length} possible endpoints`);
    
    let success = false;
    for (const endpoint of endpoints) {
      success = await testEndpoint(endpoint);
      if (success) break;
    }
    
    if (!success) {
      addLogEntry('❌ FATAL ERROR: Could not find a working checkout endpoint', 'error');
    }
    
    setIsRunning(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Checkout Diagnostic Tool</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          Run Diagnostic
        </Button>
        
        <Button
          onClick={clearLog}
          variant="outline"
          disabled={isRunning || log.length === 0}
        >
          Clear Log
        </Button>
        
        <Button
          onClick={copyLogToClipboard}
          variant="outline"
          disabled={log.length === 0}
          className="flex items-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Log
        </Button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 h-96 overflow-y-auto font-mono text-sm">
        {log.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Diagnostic log will appear here...</p>
        ) : (
          log.map((entry, index) => (
            <div 
              key={index} 
              className={`mb-1 ${
                entry.type === 'error' 
                  ? 'text-red-600 dark:text-red-400' 
                  : entry.type === 'success'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-800 dark:text-gray-300'
              }`}
            >
              {entry.timestamp}: {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 