
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get latest completed meeting with a summary
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('status', 'completed')
      .not('summary', 'is', null)
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    if (!meetings || meetings.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No meeting summaries found." }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      );
    }
    
    const latestMeeting = meetings[0];
    
    // If we have a Symbl conversation ID and no summary in the database,
    // we could fetch it from Symbl directly
    if (latestMeeting.symbl_conversation_id && !latestMeeting.summary) {
      try {
        // Get Symbl credentials
        const { data: appIdData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'symbl_app_id')
          .single();
        
        const { data: appSecretData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'symbl_app_secret')
          .single();
        
        const symblAppId = appIdData?.value;
        const symblAppSecret = appSecretData?.value;
        
        if (!symblAppId || !symblAppSecret) {
          throw new Error("Missing Symbl API credentials");
        }
        
        // Get Symbl token
        const tokenResponse = await fetch("https://api.symbl.ai/oauth2/token:generate", {
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
        
        if (!tokenResponse.ok) {
          throw new Error(`Failed to get Symbl token: ${await tokenResponse.text()}`);
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.accessToken;
        
        // Fetch conversation summary from Symbl
        const summaryResponse = await fetch(`https://api.symbl.ai/v1/conversations/${latestMeeting.symbl_conversation_id}/summary`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!summaryResponse.ok) {
          throw new Error(`Failed to get summary from Symbl: ${await summaryResponse.text()}`);
        }
        
        const summaryData = await summaryResponse.json();
        const summary = summaryData?.summary || "No summary available from Symbl API.";
        
        // Update the meeting record with the summary
        await supabase
          .from('meetings')
          .update({ summary })
          .eq('id', latestMeeting.id);
          
        // Return the fetched summary
        return new Response(
          JSON.stringify({ summary }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            },
            status: 200 
          }
        );
      } catch (symblError) {
        console.error("Error fetching from Symbl:", symblError);
        // Continue to return the meeting without summary
      }
    }
    
    // Return the meeting summary from the database
    return new Response(
      JSON.stringify({ 
        summary: latestMeeting.summary || "No summary available for this meeting.",
        meeting: {
          id: latestMeeting.id,
          title: latestMeeting.title,
          date: latestMeeting.date
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Error in symbl-summary function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: "Error retrieving meeting summary." 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});
