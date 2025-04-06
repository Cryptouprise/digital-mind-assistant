
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
    // Parse the webhook payload from Symbl
    const payload = await req.json();
    console.log("Received Symbl webhook:", JSON.stringify(payload));

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Process the meeting data
    if (payload.type === 'message_summary' || payload.type === 'conversation_completed') {
      const meetingData = {
        symbl_conversation_id: payload.conversationId,
        title: payload.name || 'Untitled Meeting',
        date: new Date().toISOString(),
        status: payload.type === 'conversation_completed' ? 'completed' : 'processing',
        summary: extractSummary(payload),
        raw_data: payload
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('meetings')
        .upsert(meetingData, { onConflict: 'symbl_conversation_id' });
        
      if (error) {
        console.error("Error saving meeting data:", error);
        throw error;
      }
      
      console.log("Successfully processed meeting data:", meetingData.symbl_conversation_id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to extract summary from Symbl payload
function extractSummary(payload: any): string {
  if (payload.type === 'message_summary' && payload.summary && payload.summary.text) {
    return payload.summary.text;
  }
  
  if (payload.insights && payload.insights.length > 0) {
    return payload.insights.map((insight: any) => insight.text).join('\n\n');
  }
  
  return 'No summary available';
}
