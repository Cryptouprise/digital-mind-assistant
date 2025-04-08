
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
  const [visualFeedback, setVisualFeedback] = useState<number[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const speechTimeoutRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const processingRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const feedbackIntervalRef = useRef<number | null>(null);
  
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
        startVisualFeedback();
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = '';
        let finalText = '';
        let hasFinalResult = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (!event.results[i].isFinal) {
            interimText += transcript;
          } else {
            finalText += transcript;
            hasFinalResult = true;
          }
        }

        // If we have a final result, process it immediately
        if (hasFinalResult && finalText.trim() && !processingRef.current) {
          processingRef.current = true;
          onTranscriptFinalized(finalText.trim());
          setInterimTranscript("");
          return;
        }

        // Update the interim transcript for display
        if (interimText) {
          setInterimTranscript(interimText);
          
          // Reset the speech timeout to detect pauses
          if (speechTimeoutRef.current) {
            window.clearTimeout(speechTimeoutRef.current);
          }
          
          // Process speech after a short pause (500ms)
          speechTimeoutRef.current = window.setTimeout(() => {
            if (interimText.trim() && !processingRef.current) {
              processingRef.current = true;
              onTranscriptFinalized(interimText.trim());
              setInterimTranscript("");
            }
          }, 500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          // Don't show toast for no-speech as it's common
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
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition service ended');
        
        // Auto restart if it's supposed to be listening and not speaking
        if (isListening && !isSpeaking && !processingRef.current) {
          restartTimeoutRef.current = window.setTimeout(() => {
            try {
              if (recognitionRef.current && isListening && !isSpeaking) {
                recognitionRef.current.start();
                console.log('Restarted speech recognition');
              }
            } catch (e) {
              console.error('Error restarting speech recognition:', e);
            }
          }, 200);
        }
      };
    }

    return () => {
      stopVisualFeedback();
      
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
  }, [isRecognitionSupported]);

  // Start generating visual feedback when listening
  const startVisualFeedback = () => {
    if (feedbackIntervalRef.current) return;
    
    feedbackIntervalRef.current = window.setInterval(() => {
      setVisualFeedback(prevState => {
        // Generate random values between 10-80 for the wave visualization
        return Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 10);
      });
    }, 150);
  };
  
  // Stop visual feedback
  const stopVisualFeedback = () => {
    if (feedbackIntervalRef.current) {
      window.clearInterval(feedbackIntervalRef.current);
      feedbackIntervalRef.current = null;
      setVisualFeedback([]);
    }
  };

  // Effect to handle speech recognition start/stop based on isListening and isSpeaking states
  useEffect(() => {
    if (isListening && recognitionRef.current && !isSpeaking && !processingRef.current) {
      try {
        recognitionRef.current.start();
        console.log('Started speech recognition');
        startVisualFeedback();
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
        stopVisualFeedback();
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
    
    // If we're not listening anymore, stop the visual feedback
    if (!isListening) {
      stopVisualFeedback();
    }
  }, [isListening, isSpeaking]);

  // Reset processing flag when the AI stops speaking
  useEffect(() => {
    if (!isSpeaking) {
      processingRef.current = false;
    }
    
    // If AI is speaking, we pause the visual feedback
    if (isSpeaking && isListening) {
      stopVisualFeedback();
    } else if (isListening && !isSpeaking && !feedbackIntervalRef.current) {
      startVisualFeedback();
    }
  }, [isSpeaking, isListening]);

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
    stopVisualFeedback();
    
    // Clear timeouts
    if (speechTimeoutRef.current) {
      window.clearTimeout(speechTimeoutRef.current);
    }
    
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    
    // Process any pending interim transcript
    if (interimTranscript.trim() && !processingRef.current) {
      processingRef.current = true;
      onTranscriptFinalized(interimTranscript.trim());
    }
    
    setInterimTranscript("");
  };

  return (
    <>
      {isListening && (
        <div className={`mb-3 p-3 ${
          interimTranscript 
            ? "bg-green-900/20 border border-green-500/30" 
            : "bg-slate-900/40 border border-slate-700/30"
        } rounded-md transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${
                interimTranscript ? "text-green-400 animate-pulse" : "text-slate-400"
              }`} />
              <span className="text-sm font-medium text-white">
                {interimTranscript ? "Hearing you..." : "Listening..."}
              </span>
            </div>
            {isSpeaking && (
              <span className="text-xs text-amber-300 animate-pulse">Jarvis is speaking...</span>
            )}
          </div>
          
          {/* Voice visualization when listening */}
          {isListening && !interimTranscript && visualFeedback.length > 0 && (
            <div className="flex items-end justify-center gap-1 h-12 bg-slate-900/50 rounded-md p-2 mt-1">
              {visualFeedback.map((height, idx) => (
                <div 
                  key={idx}
                  className="w-1 bg-blue-500 animate-pulse rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          )}
          
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
        className={`${isListening ? "animate-pulse ring-2 ring-red-500/50" : ""} transition-all duration-300`}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
    </>
  );
};

export default VoiceRecognition;
