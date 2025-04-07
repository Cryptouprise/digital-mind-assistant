
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GHL_API_BASE = "https://rest.gohighlevel.com/v1";

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
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    
    if (!GHL_API_KEY) {
      throw new Error('GHL API key not configured');
    }

    const { action, params } = await req.json();
    let result;

    const headers = {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // Execute the requested GHL action
    switch (action) {
      case 'addTagToContact':
        const { contactId, tagId } = params;
        result = await fetch(`${GHL_API_BASE}/contacts/${contactId}/tags/${tagId}`, {
          method: 'POST',
          headers
        });
        break;
        
      case 'launchWorkflow':
        const { workflowId, contactId: wfContactId } = params;
        result = await fetch(`${GHL_API_BASE}/campaigns/start`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: wfContactId,
            campaignId: workflowId
          })
        });
        break;
        
      case 'updateContact':
        const { contactId: updateContactId, fields } = params;
        result = await fetch(`${GHL_API_BASE}/contacts/${updateContactId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(fields)
        });
        break;
        
      case 'movePipelineStage':
        const { opportunityId, stageId } = params;
        result = await fetch(`${GHL_API_BASE}/opportunities/${opportunityId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ stageId })
        });
        break;
        
      case 'markAppointmentNoShow':
        const { appointmentId } = params;
        result = await fetch(`${GHL_API_BASE}/appointments/${appointmentId}/noshow`, {
          method: 'PUT',
          headers
        });
        break;
        
      case 'sendFollowUp':
        const { contactId: followUpContactId, meetingSummary } = params;
        
        // Get contact information
        const contactResponse = await fetch(`${GHL_API_BASE}/contacts/${followUpContactId}`, {
          method: 'GET',
          headers
        });
        
        if (!contactResponse.ok) {
          throw new Error(`Failed to fetch contact: ${await contactResponse.text()}`);
        }
        
        const contactData = await contactResponse.json();
        
        // Send a follow-up message
        const messageResponse = await fetch(`${GHL_API_BASE}/contacts/${followUpContactId}/sms`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: meetingSummary || `Hi ${contactData.contact.firstName || 'there'},\n\nThank you for our meeting. I wanted to follow up with you about our discussion.\n\nBest regards,\nYour Team`,
            direction: "outgoing",
          })
        });
        
        // Also update contact notes with follow-up details
        const noteResponse = await fetch(`${GHL_API_BASE}/contacts/${followUpContactId}/notes`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            note: `Follow-up sent on ${new Date().toLocaleDateString()}:\n\n${meetingSummary || 'No content provided.'}`
          })
        });
        
        result = messageResponse;
        break;
        
      default:
        throw new Error(`Unsupported GHL action: ${action}`);
    }
    
    // Process and return the response
    const responseData = await result.json();
    
    // Log the action for debugging
    console.log(`Executed GHL action: ${action}`);
    
    return new Response(
      JSON.stringify({ 
        success: result.ok,
        data: responseData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in GHL client:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
