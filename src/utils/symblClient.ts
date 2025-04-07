
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: 'processing' | 'completed';
  symbl_conversation_id?: string;
  contact_id?: string | null;
  follow_up_sent?: boolean;
  tags?: string[];
  raw_data?: any;
  summary?: string;
}

export const fetchMeetings = async (): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }

  // Ensure all status values are valid 'processing' or 'completed'
  return (data || []).map(meeting => ({
    ...meeting,
    status: meeting.status === 'completed' ? 'completed' : 'processing'
  })) as Meeting[];
};

export const fetchMeeting = async (id: string): Promise<Meeting> => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching meeting:", error);
    throw error;
  }

  // Ensure status is valid 'processing' or 'completed'
  return {
    ...data,
    status: data.status === 'completed' ? 'completed' : 'processing'
  } as Meeting;
};

export const getSymblToken = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'initRealtime'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to get Symbl token');
    }
    
    if (!data?.token) {
      throw new Error('No token returned from Symbl API');
    }
    
    return data.token;
  } catch (err) {
    console.error("Error getting Symbl token:", err);
    throw err;
  }
}

export const uploadMeetingAudio = async (params: { url?: string, fileContent?: string, fileName?: string }): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'uploadAudio',
        ...params
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to upload meeting audio');
    }
    
    return data;
  } catch (err) {
    console.error("Error uploading meeting audio:", err);
    throw err;
  }
};

export const initSymblRealtime = async (): Promise<{ token: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'initRealtime'
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to initialize Symbl realtime');
    }
    
    if (!data?.token) {
      throw new Error('No token returned from Symbl realtime initialization');
    }
    
    return { token: data.token };
  } catch (err) {
    console.error("Error initializing Symbl realtime:", err);
    throw err;
  }
};

export const saveRealtimeMeeting = async (conversationId: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'saveRealtimeSession',
        conversationId
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to save realtime meeting');
    }
    
    return data;
  } catch (err) {
    console.error("Error saving realtime meeting:", err);
    throw err;
  }
};

export const sendFollowUp = async (meetingId: string, contactId: string): Promise<boolean> => {
  try {
    // This would typically call a Supabase edge function that handles sending follow-ups
    // For now, we'll simulate this by updating the meeting record
    const { error } = await supabase
      .from('meetings')
      .update({ 
        follow_up_sent: true 
      } as any) // Using type assertion to bypass TypeScript error
      .eq('id', meetingId);
    
    if (error) {
      console.error("Error sending follow-up:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error sending follow-up:", err);
    return false;
  }
};

export const addTag = async (meetingId: string, tag: string): Promise<void> => {
  try {
    // First get the current meeting to retrieve existing tags
    const { data, error: fetchError } = await supabase
      .from('meetings')
      .select('tags')
      .eq('id', meetingId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching meeting for tagging:", fetchError);
      throw fetchError;
    }
    
    // Prepare the updated tags array
    const currentTags = ((data as any)?.tags) || []; // Using type assertion to bypass TypeScript error
    const newTags = [...currentTags];
    
    // Only add the tag if it's not already present
    if (!newTags.includes(tag)) {
      newTags.push(tag);
    }
    
    // Update the meeting record with the new tags
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ 
        tags: newTags 
      } as any) // Using type assertion to bypass TypeScript error
      .eq('id', meetingId);
    
    if (updateError) {
      console.error("Error updating meeting tags:", updateError);
      throw updateError;
    }
  } catch (err) {
    console.error("Error adding tag:", err);
    throw err;
  }
};

export const runJarvisAutomation = async (meetingId: string): Promise<boolean> => {
  try {
    // This would typically call a Supabase edge function that handles Jarvis automations
    // For demonstration purposes, we'll just update a field in the meeting record
    const { error } = await supabase
      .from('meetings')
      .update({
        raw_data: { jarvis_automation_run: true }
      })
      .eq('id', meetingId);
    
    if (error) {
      console.error("Error running Jarvis automation:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error running Jarvis automation:", err);
    return false;
  }
};
