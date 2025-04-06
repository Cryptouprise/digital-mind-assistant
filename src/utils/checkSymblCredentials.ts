
import { supabase } from "@/integrations/supabase/client";

export const checkSymblCredentials = async (): Promise<boolean> => {
  try {
    console.log("Checking Symbl credentials...");
    
    // Add retries for better reliability
    const maxRetries = 3;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Credential check attempt ${attempt + 1}/${maxRetries + 1}`);
        
        const { data, error } = await supabase.functions.invoke('symbl-client', {
          body: {
            action: 'getCredentials'
          }
        });
        
        if (error) {
          console.error(`Credential check error (attempt ${attempt + 1}):`, error);
          
          // If this is an edge function error, provide clearer feedback
          if (error.message?.includes("non-2xx")) {
            console.error("Edge function returned non-2xx status. Please check your Symbl credentials.");
          }
          
          throw new Error(error.message);
        }
        
        console.log(`Credential check response (attempt ${attempt + 1}):`, data);
        
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
          // Wait before retrying with increasing delay
          const delay = 2000 * (attempt + 1);
          console.log(`Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (retryError) {
        console.error(`Attempt ${attempt + 1} failed:`, retryError);
        if (attempt === maxRetries) throw retryError;
        
        // Wait before retrying with increasing delay
        const delay = 1500 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log("Symbl credentials not found or not valid after all attempts");
    return false;
  } catch (error) {
    console.error('Error checking Symbl credentials:', error);
    return false;
  }
};
