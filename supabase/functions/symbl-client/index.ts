
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

let SYMBL_TOKEN: string | null = null;
let tokenExpiration: number = 0;

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
          name: "Jarvis Auto Meeting Upload",
        }),
      });

      if (!response.ok) {
        throw new Error(`Symbl API error: ${await response.text()}`);
      }

      const result = await response.json();
      
      console.log("Symbl audio upload successful:", result);
      
      return new Response(
        JSON.stringify(result),
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
  
  // Request new token
  const symblAppId = Deno.env.get("SYMBL_APP_ID");
  const symblAppSecret = Deno.env.get("SYMBL_APP_SECRET");
  
  if (!symblAppId || !symblAppSecret) {
    throw new Error("Missing Symbl API credentials");
  }

  const response = await fetch("https://api.symbl.ai/oauth2/token", {
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
    throw new Error(`Failed to get Symbl token: ${await response.text()}`);
  }

  const data = await response.json();
  SYMBL_TOKEN = data.accessToken;
  
  // Set expiration to 14 minutes from now (tokens are valid for 15 minutes)
  tokenExpiration = now + 14 * 60 * 1000;
  
  return SYMBL_TOKEN;
}
