
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Volume2, VolumeX, Mic, MicOff, Activity, Send } from "lucide-react";
import { useBreakpoint } from "@/hooks/use-mobile";

type SpeechRecognitionInstance = SpeechRecognition & {
  // Additional properties specific to our implementation
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useBreakpoint(768);
  const speechTimeoutRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const restartTimeoutRef = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      
      // Restart speech recognition after audio finishes
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('Restarting speech recognition after audio');
        } catch (e) {
          console.error('Error restarting speech recognition after audio:', e);
        }
      }
    };
    
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to play audio");
      
      // Restart speech recognition after audio error
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error restarting speech recognition after audio error:', e);
        }
      }
    };

    // Initialize speech recognition
    initSpeechRecognition();

    // Clean up on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (speechTimeoutRef.current) {
        window.clearTimeout(speechTimeoutRef.current);
      }
      
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
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
              processVoiceInput(transcript.trim());
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
              processVoiceInput(interimText.trim());
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
  };

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

  // Send text message
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: input }
      });

      setIsLoading(false);
      
      if (error) {
        console.error('Error calling chat function:', error);
        toast.error("Failed to get a response. Please try again.");
        const errorMessage = { 
          sender: "jarvis", 
          text: "Sorry, I encountered an error processing your request. Please try again." 
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const botResponse = data.response;
        const botMessage = { sender: "jarvis", text: botResponse };
        setMessages((prev) => [...prev, botMessage]);
        
        // Speak the response if audio is enabled
        if (audioEnabled) {
          await speakText(botResponse);
        }
      }
    } catch (err) {
      console.error('Error in chat:', err);
      setIsLoading(false);
      toast.error("An unexpected error occurred. Please try again.");
      const errorMessage = { 
        sender: "jarvis", 
        text: "Sorry, I encountered an unexpected error. Please try again." 
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setInput("");
  };

  // Text to speech
  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Temporarily pause speech recognition while generating speech
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition before TTS:', e);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });
      
      if (error || !data?.audio) {
        throw new Error(error?.message || "Failed to synthesize speech");
      }
      
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      
      if (audioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        
        await audioRef.current.play();
        
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
          
          // Resume speech recognition after audio finishes
          if (isListening && recognitionRef.current && !processingRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Restarted speech recognition after audio playback');
            } catch (e) {
              console.error('Error restarting speech recognition after audio:', e);
            }
          }
        };
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
      toast.error("Failed to play audio response");
      
      // Resume speech recognition if there was an error with TTS
      if (isListening && recognitionRef.current && !processingRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error restarting speech recognition after TTS error:', e);
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      toast.success("Voice responses enabled");
    } else {
      toast.info("Voice responses disabled");
      if (audioRef.current && isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
    }
  };

  // Start listening
  const startListening = async () => {
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

  // Stop listening
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
      processVoiceInput(interimTranscript.trim());
    }
    
    setInterimTranscript("");
  };

  // Process voice input
  const processVoiceInput = async (text: string) => {
    if (!text || text === lastTranscriptRef.current) {
      processingRef.current = false;
      return;
    }
    
    lastTranscriptRef.current = text;
    setVoiceProcessing(true);
    setInput(text);
    
    // Add user message to chat
    const userMessage = { sender: "user", text: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    // Temporarily stop listening while processing
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping speech recognition during processing:', e);
      }
    }

    try {
      // Call chat function
      const { data: chatData, error: chatError } = await supabase.functions.invoke('chat', {
        body: { message: text }
      });

      if (chatError) {
        console.error('Error calling chat function:', chatError);
        toast.error("Failed to get a response. Please try again.");
        const errorMessage = { 
          sender: "jarvis", 
          text: "Sorry, I encountered an error processing your request. Please try again." 
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const botResponse = chatData.response;
        const botMessage = { sender: "jarvis", text: botResponse };
        setMessages((prev) => [...prev, botMessage]);
        
        // Speak response if audio is enabled
        if (audioEnabled) {
          await speakText(botResponse);
        } else if (isListening && recognitionRef.current) {
          // If not speaking, restart listening
          processingRef.current = false;
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting speech recognition after processing:', e);
          }
        }
      }
    } catch (chatErr) {
      console.error('Error in chat:', chatErr);
      toast.error("An unexpected error occurred. Please try again.");
      const errorMessage = { 
        sender: "jarvis", 
        text: "Sorry, I encountered an unexpected error. Please try again." 
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Restart listening if there was an error
      processingRef.current = false;
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error restarting speech recognition after error:', e);
        }
      }
    }
    
    // Reset state
    setIsLoading(false);
    setInput("");
    setVoiceProcessing(false);
    processingRef.current = false;
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm max-w-2xl mx-auto bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center text-white">
          <span className="mr-2">Jarvis Assistant</span>
          {(isLoading || voiceProcessing || isSpeaking) && (
            <span className="inline-block w-4 h-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></span>
          )}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAudio} 
            title={audioEnabled ? "Disable voice responses" : "Enable voice responses"}
            className={audioEnabled ? "text-primary" : "text-muted-foreground"}
          >
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading || voiceProcessing || (isSpeaking && isListening)}
            title={isListening ? "Stop listening" : "Start voice input"}
            className={isListening ? "animate-pulse" : ""}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
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
      
      <ScrollArea className="h-80 mb-4 p-2 rounded-md border bg-slate-900">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 p-4">
              Send a message or speak to start a conversation with Jarvis.
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-lg max-w-[80%] shadow-md ${
                    msg.sender === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  <p className="text-base leading-relaxed font-medium">{msg.text}</p>
                  {isSpeaking && idx === messages.length - 1 && msg.sender === "jarvis" && (
                    <div className="mt-1 text-xs opacity-70 flex items-center">
                      <Volume2 className="h-3 w-3 mr-1 animate-pulse" /> Speaking...
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Jarvis..."
          disabled={isLoading || voiceProcessing}
          className="flex-1 bg-slate-700 text-white border-slate-600 placeholder:text-slate-400"
        />
        <div className="flex gap-2">
          {!isMobile && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !isRecognitionSupported || voiceProcessing || (isSpeaking && isListening)}
              className={`hidden sm:flex items-center gap-1 ${isListening ? "animate-pulse" : ""}`}
            >
              {isListening ? "Stop" : "Voice Input"}
              {isListening ? <MicOff className="h-4 w-4 ml-1" /> : <Mic className="h-4 w-4 ml-1" />}
            </Button>
          )}
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim() || voiceProcessing}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
