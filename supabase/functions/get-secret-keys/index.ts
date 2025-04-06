
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
      openai: false,
      elevenlabs: false,
      ghl: false,
      stripe: false,
      symbl: false
    };
    
    // Check for each individual key in the settings table
    const { data: openaiKey } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'openai_api_key')
      .single();
    
    const { data: elevenlabsKey } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'elevenlabs_api_key')
      .single();
      
    const { data: ghlKey } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ghl_api_key')
      .single();
      
    const { data: stripeKey } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'stripe_secret_key')
      .single();
      
    const { data: symblAppId } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'symbl_app_id')
      .single();
      
    const { data: symblAppSecret } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'symbl_app_secret')
      .single();
    
    // Update key status based on actual settings in the database
    keyStatus = {
      openai: !!openaiKey,
      elevenlabs: !!elevenlabsKey,
      ghl: !!ghlKey,
      stripe: !!stripeKey,
      symbl: !!(symblAppId && symblAppSecret)
    };
    
    // If stored status is different from actual, update it
    if (data && !error) {
      try {
        const storedStatus = JSON.parse(data.value);
        if (JSON.stringify(storedStatus) !== JSON.stringify(keyStatus)) {
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
      } catch (e) {
        console.error('Error parsing key status:', e);
        // Update with the current status if parsing fails
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
    } else {
      // If no stored status, save the current status
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
