
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Meeting {
  id: string;
  title: string;
  date: string;
  summary: string | null;
  status?: string | null;
  symbl_conversation_id?: string | null;
  raw_data?: any;
  tags?: string[];
  contact_id?: string | null;
  follow_up_sent?: boolean;
}

export type UploadParams = 
  | { url: string } 
  | { fileContent: string; fileName: string };

export const uploadMeetingAudio = async (params: UploadParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'uploadAudio',
        ...params
      }
    });
    
    if (error) throw new Error(error.message);
    
    return data;
  } catch (error) {
    console.error('Error uploading meeting audio:', error);
    throw error;
  }
};

export const fetchMeetings = async (): Promise<Meeting[]> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Process meetings to extract tags from raw_data if available
    const processedMeetings = (data || []).map(meeting => {
      // Safely access potential nested properties with proper type checking
      let tags: string[] = [];
      let contactId: string | null = null;
      let followUpSent: boolean = false;
      
      if (meeting.raw_data) {
        if (typeof meeting.raw_data === 'object' && !Array.isArray(meeting.raw_data)) {
          const rawData = meeting.raw_data as Record<string, unknown>;
          
          // Extract tags if they exist
          if (rawData.tags && Array.isArray(rawData.tags)) {
            tags = rawData.tags as string[];
          }
          
          // Extract contact_id if it exists
          if (rawData.contact_id && typeof rawData.contact_id === 'string') {
            contactId = rawData.contact_id;
          }
          
          // Extract follow_up_sent if it exists
          if (rawData.follow_up_sent === true) {
            followUpSent = true;
          }
        }
      }
      
      return {
        ...meeting,
        tags,
        contact_id: contactId,
        follow_up_sent: followUpSent
      };
    });
    
    return processedMeetings;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

export const sendFollowUp = async (meetingId: string, contactId: string | null): Promise<boolean> => {
  if (!contactId) {
    console.error('Cannot send follow-up: No contact ID associated with this meeting');
    return false;
  }
  
  try {
    // First, fetch the meeting to get the summary
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('summary')
      .eq('id', meetingId)
      .single();
      
    if (meetingError) {
      console.error('Error fetching meeting for follow-up:', meetingError);
      throw meetingError;
    }
    
    const meetingSummary = meeting?.summary || '';
    
    // Send the follow-up with the meeting summary
    const { data, error } = await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'sendFollowUp',
        params: { 
          meetingId,
          contactId,
          meetingSummary
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Update the meeting record to mark follow-up as sent
    if (data?.success) {
      // Fetch the current meeting data first to get the existing raw_data
      const { data: currentMeeting, error: fetchError } = await supabase
        .from('meetings')
        .select('raw_data')
        .eq('id', meetingId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Prepare the updated raw_data object with proper type checking
      let updatedRawData: Record<string, unknown> = {};
      
      if (currentMeeting?.raw_data) {
        if (typeof currentMeeting.raw_data === 'object' && !Array.isArray(currentMeeting.raw_data)) {
          updatedRawData = { ...currentMeeting.raw_data as Record<string, unknown> };
        }
      }
      
      // Set follow_up_sent flag
      updatedRawData.follow_up_sent = true;
      
      // Update the meeting with the new raw_data
      await supabase
        .from('meetings')
        .update({ raw_data: updatedRawData })
        .eq('id', meetingId);
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Error sending follow-up:', error);
    return false;
  }
};

export const addTag = async (meetingId: string, tag: string): Promise<boolean> => {
  try {
    // Get current meeting data
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('raw_data')
      .eq('id', meetingId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Initialize raw_data object if it doesn't exist or isn't valid
    let rawData: Record<string, unknown> = {};
    let currentTags: string[] = [];
    
    if (meeting?.raw_data) {
      if (typeof meeting.raw_data === 'object' && !Array.isArray(meeting.raw_data)) {
        rawData = meeting.raw_data as Record<string, unknown>;
        
        // Extract existing tags if they exist
        if (rawData.tags && Array.isArray(rawData.tags)) {
          currentTags = rawData.tags as string[];
        }
      }
    }
    
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      
      // Update raw_data with new tags
      rawData.tags = updatedTags;
      
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ raw_data: rawData })
        .eq('id', meetingId);
      
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding tag:', error);
    return false;
  }
};
