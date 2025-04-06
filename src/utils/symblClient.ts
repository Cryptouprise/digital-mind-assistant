
import { supabase } from "@/integrations/supabase/client";

export interface Meeting {
  id: string;
  title: string;
  date: string;
  summary: string;
  status?: string;
  symbl_conversation_id?: string;
}

export const uploadMeetingAudio = async (audioUrl: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'uploadAudio',
        url: audioUrl
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
    
    return (data || []) as Meeting[];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};
