
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
      const tags = meeting.raw_data?.tags || [];
      const contactId = meeting.raw_data?.contact_id || null;
      const followUpSent = meeting.raw_data?.follow_up_sent || false;
      
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
    const { data, error } = await supabase.functions.invoke('ghl-client', {
      body: {
        action: 'sendFollowUp',
        params: { 
          meetingId,
          contactId
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Update the meeting record to mark follow-up as sent
    if (data?.success) {
      await supabase
        .from('meetings')
        .update({ 
          raw_data: {
            ...data.meeting?.raw_data,
            follow_up_sent: true
          }
        })
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
    
    // Update the tags
    const rawData = meeting?.raw_data || {};
    const currentTags = rawData.tags || [];
    
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ 
          raw_data: {
            ...rawData,
            tags: updatedTags
          }
        })
        .eq('id', meetingId);
      
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding tag:', error);
    return false;
  }
};

