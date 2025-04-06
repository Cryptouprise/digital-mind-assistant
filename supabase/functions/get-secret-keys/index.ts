
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the current key status
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'api_keys_status')
      .single();
      
    let keyStatus = {
      openai: Deno.env.get('OPENAI_API_KEY') !== null,
      elevenlabs: Deno.env.get('ELEVENLABS_API_KEY') !== null,
      ghl: Deno.env.get('GHL_API_KEY') !== null,
      stripe: Deno.env.get('STRIPE_SECRET_KEY') !== null
    };
    
    // If we have stored status, use that
    if (data && !error) {
      try {
        keyStatus = JSON.parse(data.value);
      } catch (e) {
        console.error('Error parsing key status:', e);
      }
    } else {
      // If no stored status, save the current environment variables status
      await supabase
        .from('settings')
        .upsert(
          { 
            key: 'api_keys_status', 
            value: JSON.stringify(keyStatus)
          },
          { onConflict: 'key' }
        );
    }
    
    return new Response(
      JSON.stringify(keyStatus),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting secret keys status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
