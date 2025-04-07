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
    
    // Retrieve the OpenAI API key from environment variables
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Call the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using gpt-4o-mini as a more modern and cost-effective alternative
        messages: [
          { 
            role: "system", 
            content: "You are Jarvis, an AI assistant for business operations.
You can help users with various tasks and CRM actions.

When appropriate, you can perform actions like:
- Send a follow-up to a contact (e.g., \"I'll send a follow-up to contact ABC123\")
- Add a tag to a contact (e.g., \"I'll add tag XYZ to contact ABC123\")
- Move an opportunity in the pipeline (e.g., \"I'll move opportunity OPP456 to stage STAGE789\")
- Launch a workflow for a contact (e.g., \"I'll launch workflow FLOW123 for contact ABC123\")
- Mark an appointment as no-show (e.g., \"I'll mark appointment APT456 as a no-show\")

Format your responses using these exact phrases when you want to trigger these actions." 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    // Log the interaction
    console.log(`User message: ${message}`);
    console.log(`Jarvis response: ${reply}`);

    return new Response(
      JSON.stringify({ response: reply }),
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
