
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Volume2, VolumeX, Mic, MicOff, Activity } from "lucide-react";
import { useBreakpoint } from "@/hooks/use-mobile";

const ChatBot = () => {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useBreakpoint(768);
  
  // Media recorder for voice input
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingInterval = useRef<number | null>(null);
  const interimChunks = useRef<Blob[]>([]);
  const interimTimer = useRef<number | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create audio element on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      toast.error("Failed to play audio");
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Clean up intervals on unmount
      if (recordingInterval.current) {
        window.clearInterval(recordingInterval.current);
      }
      if (interimTimer.current) {
        window.clearInterval(interimTimer.current);
      }
    };
  }, []);

  // Reset recording time when listening state changes
  useEffect(() => {
    if (isListening) {
      setRecordingTime(0);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        window.clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      if (interimTimer.current) {
        window.clearInterval(interimTimer.current);
        interimTimer.current = null;
      }
      setInterimTranscript("");
    }
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

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
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast.success("Microphone access granted");

      // Create a new MediaRecorder instance
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      setMediaRecorder(recorder);
      audioChunks.current = [];
      interimChunks.current = [];

      // Event handlers for the recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
          interimChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudioInput(audioBlob);
        audioChunks.current = [];
        interimChunks.current = [];
      };

      // Start recording
      recorder.start(1000); // Collect data every second for interim results
      setIsListening(true);
      toast.info("Listening... Speak now");
      
      // Setup interim transcript processing
      interimTimer.current = window.setInterval(async () => {
        if (interimChunks.current.length > 0) {
          const interimBlob = new Blob(interimChunks.current, { type: 'audio/webm' });
          await processInterimAudio(interimBlob);
          interimChunks.current = []; // Clear interim chunks after processing
        }
      }, 3000); // Process interim results every 3 seconds
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopListening = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsListening(false);
      toast.info("Processing your voice input...");

      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Clear intervals
      if (interimTimer.current) {
        window.clearInterval(interimTimer.current);
        interimTimer.current = null;
      }
    }
  };

  const processInterimAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove the data URL prefix
        
        // Only send interim audio if we're still listening
        if (!isListening) return;

        // Send to Supabase edge function for speech-to-text
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { 
            audio: base64Data,
            isInterim: true
          }
        });

        if (error || !data?.text) {
          console.log('Interim transcription failed:', error);
          return;
        }

        const transcribedText = data.text.trim();
        if (transcribedText) {
          setInterimTranscript(prev => prev ? `${prev} ${transcribedText}` : transcribedText);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.log('Error processing interim audio:', error);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove the data URL prefix

        setIsLoading(true);
        
        // Send to Supabase edge function for speech-to-text
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Data }
        });

        if (error || !data?.text) {
          console.error('Error in voice-to-text:', error);
          toast.error("Failed to process your voice. Please try again.");
          setIsLoading(false);
          return;
        }

        // Set the transcribed text as input and send it
        const transcribedText = data.text.trim();
        
        if (transcribedText) {
          setInput(transcribedText);
          
          // Add user message with transcribed text
          const userMessage = { sender: "user", text: transcribedText };
          setMessages((prev) => [...prev, userMessage]);

          // Now send the message to the chat function
          try {
            const { data: chatData, error: chatError } = await supabase.functions.invoke('chat', {
              body: { message: transcribedText }
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
        } else {
          toast.error("Could not understand audio. Please try again.");
        }
        
        setIsLoading(false);
        setInput("");
        setInterimTranscript("");
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio input:', error);
      toast.error("Failed to process audio. Please try again.");
      setIsLoading(false);
      setInterimTranscript("");
    }
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
      
      {/* Voice recording indicator */}
      {isListening && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-sm font-medium text-white">Recording voice...</span>
          </div>
          <span className="text-sm font-mono text-red-300">{formatTime(recordingTime)}</span>
        </div>
      )}
      
      {/* Interim transcript area */}
      {isListening && interimTranscript && (
        <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
          <p className="text-sm text-blue-100 leading-relaxed font-medium">
            <span className="text-blue-300 text-xs mr-2">Hearing:</span>
            "{interimTranscript}"
          </p>
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
              disabled={isLoading}
              className={`hidden sm:flex items-center gap-1 ${isListening ? "animate-pulse" : ""}`}
            >
              {isListening ? "Stop" : "Voice Input"}
              {isListening ? <MicOff className="h-4 w-4 ml-1" /> : <Mic className="h-4 w-4 ml-1" />}
            </Button>
          )}
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || isListening || !input.trim()}
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
