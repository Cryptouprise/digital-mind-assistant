
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
    const { keys } = await req.json();
    
    // Store credentials in the settings table rather than setting env vars directly
    const keysToStore = {};
    
    // Store key status in a settings table
    const keyStatus = {
      openai: false,
      elevenlabs: false,
      ghl: false,
      stripe: false,
      symbl: false
    };
    
    // Process OpenAI API key if provided
    if (keys.openai) {
      keysToStore['openai_api_key'] = keys.openai;
      keyStatus.openai = true;
    }
    
    // Process ElevenLabs API key if provided
    if (keys.elevenlabs) {
      keysToStore['elevenlabs_api_key'] = keys.elevenlabs;
      keyStatus.elevenlabs = true;
    }
    
    // Process GHL API key if provided
    if (keys.ghl) {
      keysToStore['ghl_api_key'] = keys.ghl;
      keyStatus.ghl = true;
    }
    
    // Process Stripe API key if provided
    if (keys.stripe) {
      keysToStore['stripe_secret_key'] = keys.stripe;
      keyStatus.stripe = true;
    }
    
    // Process Symbl API credentials if provided
    if (keys.symbl_app_id) {
      keysToStore['symbl_app_id'] = keys.symbl_app_id;
      keyStatus.symbl = keys.symbl_app_secret ? true : keyStatus.symbl;
    }
    
    if (keys.symbl_app_secret) {
      keysToStore['symbl_app_secret'] = keys.symbl_app_secret;
      keyStatus.symbl = keys.symbl_app_id ? true : keyStatus.symbl;
    }
    
    // Check existing Symbl credentials if not provided in this request
    if (!keys.symbl_app_id || !keys.symbl_app_secret) {
      const { data: existingAppId } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'symbl_app_id')
        .single();
      
      const { data: existingAppSecret } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'symbl_app_secret')
        .single();
        
      keyStatus.symbl = existingAppId && existingAppSecret;
    }
    
    // Store each key in the settings table
    for (const [key, value] of Object.entries(keysToStore)) {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key, value },
          { onConflict: 'key' }
        );
        
      if (error) throw error;
    }
    
    // Get the current key status for other keys not being updated
    if (!keys.openai || !keys.elevenlabs || !keys.ghl || !keys.stripe) {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'api_keys_status')
        .single();
        
      if (data) {
        try {
          const currentStatus = JSON.parse(data.value);
          if (!keys.openai) keyStatus.openai = currentStatus.openai;
          if (!keys.elevenlabs) keyStatus.elevenlabs = currentStatus.elevenlabs;
          if (!keys.ghl) keyStatus.ghl = currentStatus.ghl;
          if (!keys.stripe) keyStatus.stripe = currentStatus.stripe;
        } catch (e) {
          console.error('Error parsing current key status:', e);
        }
      }
    }
    
    // Update the API keys status
    await supabase
      .from('settings')
      .upsert(
        { 
          key: 'api_keys_status', 
          value: JSON.stringify(keyStatus)
        },
        { onConflict: 'key' }
      );
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "API keys stored successfully",
        status: keyStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating secret keys:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
