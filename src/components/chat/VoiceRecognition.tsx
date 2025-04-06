
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SpeechRecognitionInstance = SpeechRecognition & {
  // Additional properties specific to our implementation
};

interface VoiceRecognitionProps {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  isSpeaking: boolean;
  onTranscriptFinalized: (text: string) => void;
  disabled?: boolean;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  isListening,
  setIsListening,
  isSpeaking,
  onTranscriptFinalized,
  disabled = false,
}) => {
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const processingRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<number | null>(null);
  
  const isRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (isRecognitionSupported) {
      const SpeechRecognitionClass = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass() as SpeechRecognitionInstance;
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (!event.results[i].isFinal) {
            interimText += transcript;
          } else if (event.results[i].isFinal) {
            // Final result - process it immediately
            if (transcript && !processingRef.current) {
              processingRef.current = true;
              onTranscriptFinalized(transcript.trim());
              setInterimTranscript("");
              return;
            }
          }
        }

        // Update the interim transcript for display
        if (interimText) {
          setInterimTranscript(interimText);
          
          // Reset the speech timeout to detect pauses
          if (speechTimeoutRef.current) {
            window.clearTimeout(speechTimeoutRef.current);
          }
          
          // Process speech after a short pause (750ms)
          speechTimeoutRef.current = window.setTimeout(() => {
            if (interimText.trim() && !processingRef.current) {
              processingRef.current = true;
              onTranscriptFinalized(interimText.trim());
              setInterimTranscript("");
            }
          }, 750);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else if (event.error === 'audio-capture') {
          toast.error("No microphone detected. Please check your device.");
          setIsListening(false);
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone access.");
          setIsListening(false);
        } else if (event.error === 'network') {
          toast.error("Network error. Please check your connection.");
        } else if (event.error !== 'aborted') {
          // Don't show error for intentional aborts
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition service ended');
        
        // Auto restart if it's supposed to be listening and not speaking
        if (isListening && !isSpeaking && !processingRef.current) {
          // Add a small delay to prevent rapid restarts
          restartTimeoutRef.current = window.setTimeout(() => {
            try {
              if (recognitionRef.current && isListening && !isSpeaking) {
                recognitionRef.current.start();
                console.log('Restarted speech recognition');
              }
            } catch (e) {
              console.error('Error restarting speech recognition:', e);
            }
          }, 300);
        }
      };
    }

    return () => {
      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
      }
      
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition on unmount:', e);
        }
      }
    };
  }, [isRecognitionSupported, isListening, isSpeaking, onTranscriptFinalized]);

  // Effect to handle speech recognition start/stop
  useEffect(() => {
    if (isListening && recognitionRef.current && !isSpeaking && !processingRef.current) {
      try {
        recognitionRef.current.start();
        console.log('Started speech recognition');
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        toast.error("Failed to start listening. Please try again.");
        setIsListening(false);
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopped speech recognition');
        setInterimTranscript("");
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
  }, [isListening, isSpeaking]);

  const startListening = () => {
    if (!isRecognitionSupported) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    // Reset state for a fresh start
    setIsListening(true);
    setInterimTranscript("");
    lastTranscriptRef.current = "";
    processingRef.current = false;
    
    // Clear any pending timeouts
    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }
    
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    
    // Clear timeouts
    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }
    
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    
    // Process any pending interim transcript
    if (interimTranscript.trim() && !processingRef.current) {
      onTranscriptFinalized(interimTranscript.trim());
    }
    
    setInterimTranscript("");
  };

  return (
    <>
      {isListening && (
        <div className={`mb-3 p-3 ${interimTranscript ? "bg-green-900/20 border border-green-500/30" : "bg-slate-900/40 border border-slate-700/30"} rounded-md transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${interimTranscript ? "text-green-400 animate-pulse" : "text-slate-400"}`} />
              <span className="text-sm font-medium text-white">
                {interimTranscript ? "Hearing you..." : "Listening..."}
              </span>
            </div>
            {isSpeaking && (
              <span className="text-xs text-amber-300 animate-pulse">Jarvis is speaking...</span>
            )}
          </div>
          
          {interimTranscript && (
            <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50 mt-1">
              <p className="text-base leading-relaxed text-white font-medium">
                {interimTranscript}
              </p>
            </div>
          )}
        </div>
      )}
      
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        title={isListening ? "Stop listening" : "Start voice input"}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
    </>
  );
};

export default VoiceRecognition;
