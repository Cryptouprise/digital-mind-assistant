
// Utility functions for speech processing

/**
 * Processes audio data to send to the voice-to-text API
 * @param audioBlob The audio blob to process
 * @param isInterim Whether this is an interim result
 * @returns Promise with the transcribed text
 */
export const processAudioToText = async (audioBlob: Blob, isInterim = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove the data URL prefix
        
        const { data, error, status } = await fetch('/api/voice-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            audio: base64Data,
            isInterim
          })
        }).then(res => res.json());
        
        if (error) {
          console.error(`Voice-to-text error (${status}):`, error);
          reject(error);
          return;
        }
        
        if (!data?.text) {
          resolve('');
          return;
        }
        
        resolve(data.text.trim());
      } catch (error) {
        console.error('Error processing audio data:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read audio data'));
    };
    
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Formats a time in seconds to a display string (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
