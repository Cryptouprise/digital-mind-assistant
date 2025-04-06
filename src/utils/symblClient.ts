
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
      
      // Prepare the updated raw_data object with proper type safety
      const rawData = currentMeeting?.raw_data || {};
      const updatedRawData = {
        ...(typeof rawData === 'object' && rawData !== null ? rawData : {}),
        follow_up_sent: true
      };
      
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
    const currentRawData = meeting?.raw_data || {};
    
    // Get current tags or initialize empty array
    let currentTags: string[] = [];
    if (typeof currentRawData === 'object' && currentRawData !== null) {
      const typedRawData = currentRawData as Record<string, unknown>;
      if (typedRawData.tags && Array.isArray(typedRawData.tags)) {
        currentTags = typedRawData.tags as string[];
      }
    }
    
    // Add new tag if it doesn't exist
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      
      // Create new raw_data object with updated tags
      const updatedRawData = {
        ...(typeof currentRawData === 'object' && currentRawData !== null ? currentRawData : {}),
        tags: updatedTags
      };
      
      // Update the database
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ raw_data: updatedRawData })
        .eq('id', meetingId);
      
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding tag:', error);
    return false;
  }
};

export const runJarvisAutomation = async (meetingId: string): Promise<boolean> => {
  try {
    console.log("Running Jarvis automation for meeting:", meetingId);
    
    const { data, error } = await supabase.functions.invoke('jarvis-actions', {
      body: {
        action: 'auto_process',
        meetingId,
        automation: true
      }
    });
    
    if (error) {
      console.error('Error running Jarvis automation:', error);
      throw new Error(error.message);
    }
    
    console.log("Jarvis automation results:", data);
    return data?.success || false;
  } catch (error) {
    console.error('Error in Jarvis automation:', error);
    return false;
  }
};

export const saveRealtimeMeeting = async (conversationId: string): Promise<boolean> => {
  try {
    console.log("Saving realtime meeting conversation:", conversationId);
    
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'saveRealtimeSession',
        conversationId
      }
    });
    
    if (error) {
      console.error('Error saving realtime meeting:', error);
      throw new Error(error.message);
    }
    
    console.log("Realtime meeting saved:", data);
    return data?.success || false;
  } catch (error) {
    console.error('Error saving realtime meeting:', error);
    return false;
  }
};

export const initSymblRealtime = async (): Promise<{token: string, expiresAt: number}> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'initRealtime'
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data?.token) {
      throw new Error('Could not initialize Symbl token');
    }
    
    return {
      token: data.token,
      expiresAt: data.expiresAt || (Date.now() + 15 * 60 * 1000) // Default 15 min expiration
    };
  } catch (error) {
    console.error('Error initializing Symbl realtime:', error);
    throw error;
  }
};
