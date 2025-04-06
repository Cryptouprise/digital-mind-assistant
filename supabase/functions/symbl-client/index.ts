
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';

let SYMBL_TOKEN: string | null = null;
let tokenExpiration: number = 0;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, webhookUrl } = await req.json();

    if (action === 'uploadAudio') {
      if (!url) {
        throw new Error('Missing required url parameter');
      }

      const token = await getSymblToken();
      
      const response = await fetch("https://api.symbl.ai/v1/process/audio/url", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          webhookUrl: webhookUrl || `${req.url.split('/symbl-client')[0]}/meeting-webhook`,
          name: "Jarvis Meeting Recording",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Symbl API error response:", errorText);
        throw new Error(`Symbl API error: ${errorText}`);
      }

      const result = await response.json();
      
      console.log("Symbl audio upload successful:", result);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'getCredentials') {
      // For securely checking if credentials are set
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get stored credentials from settings table
      const { data: appIdData, error: appIdError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'symbl_app_id')
        .single();
        
      if (appIdError && appIdError.code !== 'PGRST116') {
        console.error("Error fetching Symbl App ID:", appIdError);
      }
        
      const { data: appSecretData, error: appSecretError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'symbl_app_secret')
        .single();
        
      if (appSecretError && appSecretError.code !== 'PGRST116') {
        console.error("Error fetching Symbl App Secret:", appSecretError);
      }
      
      const appId = appIdData?.value;
      const appSecret = appSecretData?.value;
      
      // If both credentials exist, try to verify them
      let isVerified = false;
      
      if (appId && appSecret) {
        try {
          // Attempt to get a token to verify the credentials
          const response = await fetch("https://api.symbl.ai/oauth2/token:generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "application",
              appId: appId,
              appSecret: appSecret,
            }),
          });
          
          isVerified = response.ok;
          
          if (!response.ok) {
            console.error("Symbl credential verification failed:", await response.text());
          } else {
            console.log("Symbl credential verification successful");
            // Store the token for future use
            const data = await response.json();
            SYMBL_TOKEN = data.accessToken;
            tokenExpiration = Date.now() + 14 * 60 * 1000; // 14 minutes from now
          }
        } catch (error) {
          console.error("Error verifying Symbl credentials:", error);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          credentialsSet: isVerified,
          hasCredentials: !!(appId && appSecret)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error("Error in symbl-client function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Get Symbl token, handling expiration
async function getSymblToken(): Promise<string> {
  const now = Date.now();
  
  // Return existing token if it's still valid (with 1-minute buffer)
  if (SYMBL_TOKEN && now < tokenExpiration - 60000) {
    return SYMBL_TOKEN;
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get credentials from settings table
  const { data: appIdData, error: appIdError } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'symbl_app_id')
    .single();
    
  if (appIdError) throw new Error(`Could not retrieve Symbl App ID: ${appIdError.message}`);
    
  const { data: appSecretData, error: appSecretError } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'symbl_app_secret')
    .single();
    
  if (appSecretError) throw new Error(`Could not retrieve Symbl App Secret: ${appSecretError.message}`);
  
  const symblAppId = appIdData?.value;
  const symblAppSecret = appSecretData?.value;
  
  if (!symblAppId || !symblAppSecret) {
    throw new Error("Missing Symbl API credentials. Please set SYMBL_APP_ID and SYMBL_APP_SECRET in your credentials.");
  }

  const response = await fetch("https://api.symbl.ai/oauth2/token:generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "application",
      appId: symblAppId,
      appSecret: symblAppSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Symbl token error:", errorText);
    throw new Error(`Failed to get Symbl token: ${errorText}`);
  }

  const data = await response.json();
  SYMBL_TOKEN = data.accessToken;
  
  // Set expiration to 14 minutes from now (tokens are valid for 15 minutes)
  tokenExpiration = now + 14 * 60 * 1000;
  
  return SYMBL_TOKEN;
}
