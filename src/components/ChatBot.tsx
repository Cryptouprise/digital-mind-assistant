
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Volume2, VolumeX, Mic, MicOff, Activity } from "lucide-react";
import { useBreakpoint } from "@/hooks/use-mobile";
import { processAudioToText, formatTime } from "@/utils/speechUtils";

const ChatBot = () => {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useBreakpoint(768);
  
  // Speech recognition setup
  const recognitionRef = useRef<any>(null);
  const isRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

  // Create audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to play audio");
    };

    // Initialize speech recognition if supported
    if (isRecognitionSupported) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        // Update the interim transcript
        setInterimTranscript(interimText);

        // If we have final text, process it
        if (finalText) {
          processVoiceInput(finalText.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          toast.error("Network error. Please check your connection.");
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Only restart if we're still supposed to be listening
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Error restarting speech recognition:', e);
          }
        }
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update recognition state when listening changes
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log('Error starting speech recognition:', e);
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping speech recognition:', e);
      }
    }
  }, [isListening]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the Supabase Edge Function for chat
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
        // Add bot response
        const botResponse = data.response;
        const botMessage = { sender: "jarvis", text: botResponse };
        setMessages((prev) => [...prev, botMessage]);
        
        // If audio is enabled, convert the text to speech
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

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });
      
      if (error || !data?.audio) {
        throw new Error(error?.message || "Failed to synthesize speech");
      }
      
      // Convert base64 to an audio Blob
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      
      // Play the audio
      if (audioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        
        // Clean up URL object after playing
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
        };
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
      toast.error("Failed to play audio response");
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      toast.success("Voice responses enabled");
    } else {
      toast.info("Voice responses disabled");
      // Stop any current speech
      if (audioRef.current && isSpeaking) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
    }
  };

  const startListening = async () => {
    if (!isRecognitionSupported) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    setIsListening(true);
    setInterimTranscript("");
    toast.success("Listening... Speak now");
  };

  const stopListening = () => {
    setIsListening(false);
    toast.info("Stopped listening.");
    if (interimTranscript.trim()) {
      processVoiceInput(interimTranscript.trim());
    }
    setInterimTranscript("");
  };

  const processVoiceInput = async (text: string) => {
    if (!text) return;
    
    setInput(text);
    
    // Add user message with transcribed text
    const userMessage = { sender: "user", text: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
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
        // Add bot response
        const botResponse = chatData.response;
        const botMessage = { sender: "jarvis", text: botResponse };
        setMessages((prev) => [...prev, botMessage]);
        
        // If audio is enabled, convert the text to speech
        if (audioEnabled) {
          await speakText(botResponse);
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
    }
    
    setIsLoading(false);
    setInput("");
    setInterimTranscript("");
  };

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
          {isLoading && (
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
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Start voice input"}
            className={isListening ? "animate-pulse" : ""}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Voice input indicator with live transcription */}
      {isListening && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Listening...</span>
            </div>
          </div>
          
          {/* Live transcription display */}
          <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50 mt-1">
            <p className="text-base leading-relaxed text-white font-medium min-h-[2.5rem]">
              {interimTranscript || <span className="text-slate-400 italic">Speak now...</span>}
            </p>
          </div>
        </div>
      )}
      
      <ScrollArea className="h-80 mb-4 p-2 rounded-md border bg-slate-900">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 p-4">
              Send a message to start a conversation with Jarvis.
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
                  {isSpeaking && msg === messages[messages.length - 1] && msg.sender === "jarvis" && (
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
          disabled={isLoading || isListening}
          className="flex-1 bg-slate-700 text-white border-slate-600 placeholder:text-slate-400"
        />
        <div className="flex gap-2">
          {!isMobile && (
            <Button
              variant={isListening ? "destructive" : "outline"}
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading || !isRecognitionSupported}
              className={`hidden sm:flex items-center gap-1 ${isListening ? "animate-pulse" : ""}`}
            >
              {isListening ? "Stop" : "Voice Input"}
              {isListening ? <MicOff className="h-4 w-4 ml-1" /> : <Mic className="h-4 w-4 ml-1" />}
            </Button>
          )}
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
