
import { supabase } from "@/integrations/supabase/client";

export const checkSymblCredentials = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('symbl-client', {
      body: {
        action: 'getCredentials'
      }
    });
    
    if (error) throw new Error(error.message);
    
    return data?.credentialsSet || false;
  } catch (error) {
    console.error('Error checking Symbl credentials:', error);
    return false;
  }
};
