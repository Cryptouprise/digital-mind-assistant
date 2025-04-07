import { supabase } from "@/integrations/supabase/client";

export const fetchMeetings = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error("Error fetching meetings:", error);
    throw error;
  }

  return data;
};

export const fetchMeeting = async (id: string) => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching meeting:", error);
    throw error;
  }

  return data;
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
