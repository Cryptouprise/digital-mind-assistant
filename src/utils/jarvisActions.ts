
import { supabase } from "@/integrations/supabase/client";

// Jarvis Actions client for frontend use
export const jarvisActions = {
  /**
   * Add a tag to a contact
   * @param contactId - GHL Contact ID
   * @param tagId - GHL Tag ID
   */
  addTag: async (contactId: string, tagId: string) => {
    return await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'add_tag',
        contactId,
        tagId
      }
    });
  },

  /**
   * Launch a workflow for a contact
   * @param workflowId - GHL Workflow/Campaign ID
   * @param contactId - GHL Contact ID
   */
  launchWorkflow: async (workflowId: string, contactId: string) => {
    return await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'launch_workflow',
        workflowId,
        contactId
      }
    });
  },

  /**
   * Update a contact's fields
   * @param contactId - GHL Contact ID
   * @param fields - Object with fields to update
   */
  updateContact: async (contactId: string, fields: Record<string, any>) => {
    return await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'update_contact',
        contactId,
        fields
      }
    });
  },

  /**
   * Move an opportunity to a different pipeline stage
   * @param opportunityId - GHL Opportunity ID
   * @param stageId - GHL Pipeline Stage ID
   */
  movePipelineStage: async (opportunityId: string, stageId: string) => {
    return await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'move_pipeline_stage',
        opportunityId,
        stageId
      }
    });
  },

  /**
   * Mark an appointment as no-show
   * @param appointmentId - GHL Appointment ID
   */
  markNoShow: async (appointmentId: string) => {
    return await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'mark_no_show',
        appointmentId
      }
    });
  }
};
