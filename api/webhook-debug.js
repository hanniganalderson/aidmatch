// api/webhook-debug.js
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Configuration for raw body parsing
export const config = {
  api: {
    bodyParser: false
  }
};

// Helper function to get raw body
async function getRawBody(req) {
  const buf = await buffer(req);
  return buf;
}

export default async function handler(req, res) {
  // Accept OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get raw body for logging
    const rawBody = await getRawBody(req);
    const bodyText = rawBody.toString();
    
    // Initialize Supabase client for logging
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log the webhook event for debugging
    await supabase.from('webhook_logs').insert({
      request_method: req.method,
      request_headers: JSON.stringify(req.headers),
      request_body: bodyText,
      timestamp: new Date().toISOString(),
      source_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    
    // Log to console as well
    console.log('Webhook debug received:');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Body:', bodyText.substring(0, 500) + (bodyText.length > 500 ? '...(truncated)' : ''));
    
    return res.status(200).json({ received: true, message: 'Debug event logged successfully' });
  } catch (error) {
    console.error('Webhook debug error:', error);
    return res.status(500).json({ error: 'Failed to process debug webhook', message: error.message });
  }
}