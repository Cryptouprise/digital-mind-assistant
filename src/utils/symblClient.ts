
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
    
    // Explicitly type the data as Meeting[]
    return (data as unknown as Meeting[]) || [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};
