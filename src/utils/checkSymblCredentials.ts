
import { supabase } from "@/integrations/supabase/client";

export const checkSymblCredentials = async (): Promise<boolean> => {
  try {
    // Add retries for better reliability
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('symbl-client', {
          body: {
            action: 'getCredentials'
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data?.credentialsSet) {
          console.log("Symbl credentials verification successful");
          return true;
        }
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1500));
          console.log(`Retrying credential check (attempt ${attempt + 1})`);
        }
      } catch (retryError) {
        console.error(`Attempt ${attempt} failed:`, retryError);
        if (attempt === maxRetries) throw retryError;
      }
    }
    
    console.log("Symbl credentials not found or not valid");
    return false;
  } catch (error) {
    console.error('Error checking Symbl credentials:', error);
    return false;
  }
};
