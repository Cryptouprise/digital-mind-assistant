
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

    // Get meetings from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .gte('date', oneWeekAgo.toISOString());
    
    if (meetingsError) {
      console.error("Error fetching meetings:", meetingsError);
      throw meetingsError;
    }
    
    // Get AI logs that mention follow-ups
    const { data: followUps, error: followUpsError } = await supabase
      .from('ai_logs')
      .select('*')
      .ilike('prompt', '%follow up%');
      
    if (followUpsError) {
      console.error("Error fetching follow-ups:", followUpsError);
      throw followUpsError;
    }

    // Since we don't have a campaigns table yet, we'll mock this data
    const campaignsCount = 3; // Mock value

    // Return the dashboard stats
    return new Response(
      JSON.stringify({
        meetings: meetings?.length || 0,
        campaigns: campaignsCount,
        followUps: followUps?.length || 0,
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
    console.error("Error in dashboard-stats function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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
