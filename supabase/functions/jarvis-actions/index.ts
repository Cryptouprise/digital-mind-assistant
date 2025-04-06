
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
    const body = await req.json();
    const { action, contactId, tagId, workflowId, fields, opportunityId, stageId, appointmentId } = body;
    
    if (!action) {
      throw new Error('Missing required parameter: action');
    }
    
    // Call the ghl-client edge function with the appropriate parameters
    const ghlResponse = await fetch(
      `${req.url.split('/jarvis-actions')[0]}/ghl-client`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
          'x-client-info': req.headers.get('x-client-info') || '',
        },
        body: JSON.stringify({
          action: mapActionToGhlAction(action, { contactId, tagId, workflowId, fields, opportunityId, stageId, appointmentId }),
          params: getParamsForAction(action, { contactId, tagId, workflowId, fields, opportunityId, stageId, appointmentId })
        })
      }
    );
    
    const result = await ghlResponse.json();
    
    // Log the action for audit purposes
    console.log(`Executed Jarvis action: ${action}`);
    
    return new Response(
      JSON.stringify({ 
        success: ghlResponse.ok,
        data: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in Jarvis actions:", error);
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

// Map frontend action names to GHL client action names
function mapActionToGhlAction(action: string, params: any): string {
  switch (action) {
    case "add_tag":
      return "addTagToContact";
    case "launch_workflow":
      return "launchWorkflow";
    case "update_contact":
      return "updateContact";
    case "move_pipeline_stage":
      return "movePipelineStage";
    case "mark_no_show":
      return "markAppointmentNoShow";
    default:
      throw new Error(`Invalid action type: ${action}`);
  }
}

// Get the appropriate parameters for the GHL client action
function getParamsForAction(action: string, params: any): any {
  switch (action) {
    case "add_tag":
      return { contactId: params.contactId, tagId: params.tagId };
    case "launch_workflow":
      return { workflowId: params.workflowId, contactId: params.contactId };
    case "update_contact":
      return { contactId: params.contactId, fields: params.fields };
    case "move_pipeline_stage":
      return { opportunityId: params.opportunityId, stageId: params.stageId };
    case "mark_no_show":
      return { appointmentId: params.appointmentId };
    default:
      throw new Error(`Invalid action type: ${action}`);
  }
}
