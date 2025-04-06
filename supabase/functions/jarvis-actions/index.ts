
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
    const { action, contactId, tagId, workflowId, fields, opportunityId, stageId, appointmentId, meetingId, automation } = body;
    
    if (!action) {
      throw new Error('Missing required parameter: action');
    }
    
    // For Admin Jarvis Mode - Automated Actions
    if (automation && action === 'auto_process') {
      console.log("Running automated Jarvis actions for meeting:", meetingId);
      
      // Call symbl-client edge function to get meeting data
      const meetingResponse = await fetch(
        `${req.url.split('/jarvis-actions')[0]}/symbl-client`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
            'x-client-info': req.headers.get('x-client-info') || '',
          },
          body: JSON.stringify({
            action: 'getMeetingData',
            meetingId
          })
        }
      );
      
      if (!meetingResponse.ok) {
        throw new Error(`Failed to fetch meeting data: ${await meetingResponse.text()}`);
      }
      
      const meetingData = await meetingResponse.json();
      
      // Run automated actions based on meeting content
      const automatedActions = [];
      
      // Extract contact ID if available
      const contactId = meetingData.raw_data?.contact_id;
      if (!contactId) {
        throw new Error("No contact ID associated with this meeting");
      }
      
      // Example: Detect meeting topics and add appropriate tags
      const insights = meetingData.raw_data?.insights?.insights || [];
      const summary = meetingData.summary || '';
      
      // Detect topics and add tags
      const possibleTopics = [
        { keyword: "pricing", tagId: "12345", action: "add_tag" },
        { keyword: "demo", tagId: "12346", action: "add_tag" },
        { keyword: "support", tagId: "12347", action: "add_tag" },
        { keyword: "interested", workflowId: "567890", action: "launch_workflow" },
      ];
      
      const textToAnalyze = summary.toLowerCase() + ' ' + insights.map(i => i.text || '').join(' ').toLowerCase();
      
      for (const topic of possibleTopics) {
        if (textToAnalyze.includes(topic.keyword)) {
          if (topic.action === "add_tag" && topic.tagId) {
            // Call GHL client to add the tag
            automatedActions.push({
              action: "add_tag",
              params: { contactId, tagId: topic.tagId }
            });
          } else if (topic.action === "launch_workflow" && topic.workflowId) {
            // Call GHL client to launch workflow
            automatedActions.push({
              action: "launch_workflow",
              params: { contactId, workflowId: topic.workflowId }
            });
          }
        }
      }
      
      // Execute all automated actions
      const results = await Promise.all(
        automatedActions.map(autoAction => 
          fetch(
            `${req.url.split('/jarvis-actions')[0]}/ghl-client`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.get('Authorization') || '',
                'x-client-info': req.headers.get('x-client-info') || '',
              },
              body: JSON.stringify({
                action: autoAction.action,
                params: autoAction.params
              })
            }
          ).then(res => res.json())
        )
      );
      
      return new Response(
        JSON.stringify({ 
          success: true,
          automatedActions: automatedActions.length,
          results
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Call the ghl-client edge function with the appropriate parameters for regular actions
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
