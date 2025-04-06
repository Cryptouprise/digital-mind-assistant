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
    const { action, url, fileContent, fileName, webhookUrl, meetingId, conversationId } = await req.json();

    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'uploadAudio') {
      const token = await getSymblToken();
      
      if (url) {
        // Process URL upload
        console.log("Processing URL upload:", url);
        
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
          console.error("Symbl API error response for URL upload:", errorText);
          throw new Error(`Symbl API error: ${errorText}`);
        }

        const result = await response.json();
        
        console.log("Symbl audio URL upload successful:", result);
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (fileContent && fileName) {
        // Process file upload
        console.log("Processing file upload:", fileName);
        
        // Decode base64 file content
        const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
        
        // Create a blob with the binary data
        const file = new Blob([binaryData]);
        
        // Create form data
        const formData = new FormData();
        formData.append('name', fileName);
        formData.append('file', file, fileName);
        formData.append('webhookUrl', webhookUrl || `${req.url.split('/symbl-client')[0]}/meeting-webhook`);
        
        const response = await fetch("https://api.symbl.ai/v1/process/audio", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Symbl API error response for file upload:", errorText);
          throw new Error(`Symbl API error: ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log("Symbl file upload successful:", result);
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error("Missing required parameters. Either 'url' or both 'fileContent' and 'fileName' must be provided");
      }
    } else if (action === 'getCredentials') {
      // For securely checking if credentials are set
      
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
    } else if (action === 'getMeetingData') {
      if (!meetingId) {
        throw new Error("Missing required parameter: meetingId");
      }
      
      // Fetch meeting data from the database
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching meeting data: ${error.message}`);
      }
      
      if (!meeting) {
        throw new Error(`Meeting not found with ID: ${meetingId}`);
      }
      
      // If the meeting has a symbl_conversation_id and is not completed yet, fetch the latest data from Symbl API
      if (meeting.symbl_conversation_id && meeting.status !== 'completed') {
        try {
          const token = await getSymblToken();
          
          const conversationResponse = await fetch(
            `https://api.symbl.ai/v1/conversations/${meeting.symbl_conversation_id}`, 
            {
              headers: {
                "Authorization": `Bearer ${token}`,
              }
            }
          );
          
          if (conversationResponse.ok) {
            const conversationData = await conversationResponse.json();
            
            // Check if conversation is completed
            if (conversationData.status === 'completed') {
              // Update the meeting status
              await supabase
                .from('meetings')
                .update({ status: 'completed' })
                .eq('id', meetingId);
              
              meeting.status = 'completed';
            }
          }
        } catch (error) {
          console.error("Error updating meeting status from Symbl:", error);
          // Continue with existing meeting data even if update fails
        }
      }
      
      return new Response(
        JSON.stringify(meeting),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'initRealtime') {
      // Initialize Symbl's realtime API token
      console.log("Initializing Symbl realtime token");
      const token = await getSymblToken();
      
      return new Response(
        JSON.stringify({ 
          success: true,
          token,
          expiresAt: tokenExpiration
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'saveRealtimeSession') {
      // Save a realtime session to the database
      console.log("Saving realtime session for conversation:", conversationId);
      
      if (!conversationId) {
        throw new Error("Missing required parameter: conversationId");
      }
      
      // Create a new meeting entry from the realtime session
      const meetingData = {
        id: conversationId,
        title: `Live Meeting ${new Date().toISOString().slice(0, 10)}`,
        date: new Date().toISOString(),
        status: 'completed',
        symbl_conversation_id: conversationId,
        summary: "Real-time meeting session",
        raw_data: {
          from_realtime: true,
          created_at: new Date().toISOString()
        }
      };
      
      // Insert with upsert to handle potential duplicates
      const { data, error } = await supabase
        .from('meetings')
        .upsert([meetingData], { onConflict: 'id' })
        .select();
        
      if (error) {
        console.error("Error saving realtime session:", error);
        throw new Error(`Failed to save realtime session: ${error.message}`);
      }
      
      console.log("Successfully saved realtime session:", data);
      
      return new Response(
        JSON.stringify({
          success: true,
          meeting: data?.[0] || null
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
