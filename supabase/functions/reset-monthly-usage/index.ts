import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This function should be scheduled to run on the 1st of each month
serve(async (req) => {
  // Verify the request is authorized (e.g., using a secret key)
  const authHeader = req.headers.get('Authorization');
  const expectedToken = Deno.env.get('CRON_SECRET');
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    // Reset all feature usage counts
    const { error } = await supabase
      .from('feature_usage')
      .update({ count: 0, last_used: new Date().toISOString() });
      
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Monthly usage reset completed' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (err) {
    console.error('Error resetting monthly usage:', err);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 