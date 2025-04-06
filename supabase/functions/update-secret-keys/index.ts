
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
    
    // Update OpenAI API key if provided
    if (keys.openai) {
      await Deno.env.set('OPENAI_API_KEY', keys.openai);
    }
    
    // Update ElevenLabs API key if provided
    if (keys.elevenlabs) {
      await Deno.env.set('ELEVENLABS_API_KEY', keys.elevenlabs);
    }
    
    // Update GHL API key if provided
    if (keys.ghl) {
      await Deno.env.set('GHL_API_KEY', keys.ghl);
    }
    
    // Update Stripe API key if provided
    if (keys.stripe) {
      await Deno.env.set('STRIPE_SECRET_KEY', keys.stripe);
    }
    
    // Store which keys are set in a settings table
    const keyStatus = {
      openai: !!keys.openai || Deno.env.get('OPENAI_API_KEY') !== null,
      elevenlabs: !!keys.elevenlabs || Deno.env.get('ELEVENLABS_API_KEY') !== null,
      ghl: !!keys.ghl || Deno.env.get('GHL_API_KEY') !== null,
      stripe: !!keys.stripe || Deno.env.get('STRIPE_SECRET_KEY') !== null
    };
    
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
      JSON.stringify({ success: true }),
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
