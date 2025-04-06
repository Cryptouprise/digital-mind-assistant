
import { supabase } from "@/integrations/supabase/client";

// GHL Client for frontend use
export const ghlClient = {
  /**
   * Add a tag to a contact
   * @param contactId - GHL Contact ID
   * @param tagId - GHL Tag ID
   */
  addTagToContact: async (contactId: string, tagId: string) => {
    return await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'addTagToContact',
        params: { contactId, tagId }
      }
    });
  },

  /**
   * Launch a workflow for a contact
   * @param workflowId - GHL Workflow/Campaign ID
   * @param contactId - GHL Contact ID
   */
  launchWorkflow: async (workflowId: string, contactId: string) => {
    return await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'launchWorkflow',
        params: { workflowId, contactId }
      }
    });
  },

  /**
   * Update a contact's fields
   * @param contactId - GHL Contact ID
   * @param fields - Object with fields to update
   */
  updateContact: async (contactId: string, fields: Record<string, any>) => {
    return await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'updateContact',
        params: { contactId, fields }
      }
    });
  },

  /**
   * Move an opportunity to a different pipeline stage
   * @param opportunityId - GHL Opportunity ID
   * @param stageId - GHL Pipeline Stage ID
   */
  movePipelineStage: async (opportunityId: string, stageId: string) => {
    return await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'movePipelineStage',
        params: { opportunityId, stageId }
      }
    });
  },

  /**
   * Mark an appointment as no-show
   * @param appointmentId - GHL Appointment ID
   */
  markAppointmentNoShow: async (appointmentId: string) => {
    return await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'markAppointmentNoShow',
        params: { appointmentId }
      }
    });
  }
};
