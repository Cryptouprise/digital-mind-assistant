
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { message } = await req.json();
    
    // Here you could integrate with an AI service
    // For now, we'll use a simple response mechanism
    let response = "I'm Jarvis, your digital assistant. How can I help you today?";
    
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      response = "Hello! How can I assist you today?";
    } else if (message.toLowerCase().includes("help")) {
      response = "I can help you with various tasks. Just let me know what you need!";
    } else if (message.toLowerCase().includes("bye")) {
      response = "Goodbye! Have a great day!";
    } else if (message.toLowerCase().includes("thank")) {
      response = "You're welcome! Is there anything else I can help you with?";
    }

    // Log the interaction
    console.log(`User message: ${message}`);
    console.log(`Jarvis response: ${response}`);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing chat:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
