
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
    const webhookData = await req.json();

    console.log("Received Symbl webhook data:", JSON.stringify(webhookData));

    // Get conversation data
    const conversationId = webhookData?.data?.conversationId;
    if (!conversationId) {
      throw new Error('Missing conversationId in webhook payload');
    }

    // Get conversation metadata from Symbl
    const response = await fetch(`https://api.symbl.ai/v1/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getSymblToken(supabase)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching conversation data: ${await response.text()}`);
    }

    const conversationData = await response.json();
    
    // Get conversation insights and summary
    const insightsResponse = await fetch(`https://api.symbl.ai/v1/conversations/${conversationId}/insights`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getSymblToken(supabase)}`,
        'Content-Type': 'application/json',
      },
    });

    if (!insightsResponse.ok) {
      throw new Error(`Error fetching insights: ${await insightsResponse.text()}`);
    }
    
    const insightsData = await insightsResponse.json();
    
    // Save to database
    const meetingData = {
      title: conversationData.name || `Meeting ${new Date().toISOString()}`,
      date: new Date(conversationData.startTime || Date.now()).toISOString(),
      summary: generateSummary(insightsData.insights),
      status: webhookData.type === 'conversation_completed' ? 'completed' : 'processing',
      symbl_conversation_id: conversationId,
      raw_data: {
        conversation: conversationData,
        insights: insightsData,
        webhook: webhookData
      }
    };

    const { data, error } = await supabase
      .from('meetings')
      .upsert(
        { 
          id: webhookData?.data?.conversationId,
          ...meetingData
        }, 
        { onConflict: 'id' }
      );

    if (error) {
      throw error;
    }

    console.log("Successfully processed meeting webhook data");
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in meeting-webhook function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Generate a simple summary from insights
function generateSummary(insights: any[] = []): string {
  if (!insights || !insights.length) {
    return "No summary available yet.";
  }
  
  // Extract text from the first few insights
  const summaryPoints = insights
    .slice(0, 5)
    .map(insight => insight.text)
    .filter(Boolean);
    
  return summaryPoints.length > 0 
    ? summaryPoints.join("\n\n")
    : "No summary available yet.";
}

// Get Symbl token from stored credentials
async function getSymblToken(supabase): Promise<string> {
  // Get credentials from settings table
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
    throw new Error(`Failed to get Symbl token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.accessToken;
}
