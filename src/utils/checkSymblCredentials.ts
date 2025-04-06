
import { supabase } from "@/integrations/supabase/client";

export const checkSymblCredentials = async (): Promise<boolean> => {
  try {
    // Add retries for better reliability
    const maxRetries = 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('symbl-client', {
          body: {
            action: 'getCredentials'
          }
        });
        
        if (error) {
          console.error(`Credential check error (attempt ${attempt}):`, error);
          throw new Error(error.message);
        }
        
        console.log(`Credential check response (attempt ${attempt}):`, data);
        
        if (data?.credentialsSet) {
          console.log("Symbl credentials verification successful");
          return true;
        }
        
        // If we have credentials but they didn't verify, that's a problem
        if (data?.hasCredentials && !data?.credentialsSet) {
          console.error("Symbl credentials exist but failed verification");
          return false;
        }
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log(`Retrying credential check (attempt ${attempt + 1})`);
        }
      } catch (retryError) {
        console.error(`Attempt ${attempt} failed:`, retryError);
        if (attempt === maxRetries) throw retryError;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.log("Symbl credentials not found or not valid");
    return false;
  } catch (error) {
    console.error('Error checking Symbl credentials:', error);
    return false;
  }
};
