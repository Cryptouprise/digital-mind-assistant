
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBreakpoint } from "@/hooks/use-mobile";
import VoiceRecognition from "./chat/VoiceRecognition";
import MessageList from "./chat/MessageList";
import InputArea from "./chat/InputArea";
import AudioToggle from "./chat/AudioToggle";
import { Bot, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  sender: string;
  text: string;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useBreakpoint(768);
  const lastTranscriptRef = useRef<string>("");
  const processingRef = useRef<boolean>(false);
  const responseQueueRef = useRef<{text: string}[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  
  // Mock contact context for demo purposes
  const contactContext = {
    id: "CONT12345",
    name: "John Smith",
    stage: "Qualified Lead",
    tags: ["interested", "follow-up", "high-value"]
  };
  
  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.onended = handleAudioEnded;
    audioRef.current.onerror = handleAudioError;
    
    // Generate a conversation ID if none exists
    if (!conversationId) {
      setConversationId(crypto.randomUUID());
    }
    
    // Clean up on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
      }
    };
  }, []);

  // Handle audio ending 
  const handleAudioEnded = () => {
    setIsSpeaking(false);
    isPlayingRef.current = false;
    
    // Try to play next queued response if any
    processNextQueuedResponse();
    
    // Restart speech recognition after audio finishes
    if (isListening) {
      processingRef.current = false;
    }
  };
  
  // Handle audio error
  const handleAudioError = () => {
    setIsSpeaking(false);
    isPlayingRef.current = false;
    toast.error("Failed to play audio");
    processingRef.current = false;
    processNextQueuedResponse();
  };
  
  // Process next queued response
  const processNextQueuedResponse = () => {
    if (responseQueueRef.current.length > 0 && !isPlayingRef.current) {
      const nextResponse = responseQueueRef.current.shift();
      if (nextResponse && audioEnabled) {
        speakText(nextResponse.text).catch(console.error);
      }
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          message: input,
          conversationId,
          contactContext
        }
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
        
        // Update conversation ID if returned from backend
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        
        // Speak the response if audio is enabled
        if (audioEnabled) {
          // If already speaking, queue this response
          if (isSpeaking || isPlayingRef.current) {
            responseQueueRef.current.push({ text: botResponse });
          } else {
            await speakText(botResponse);
          }
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
      isPlayingRef.current = true;
      
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
        
        // Event listeners are already set in useEffect, 
        // but setting URL revocation directly here
        const originalOnEnded = audioRef.current.onended;
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (originalOnEnded) {
            // @ts-ignore: We know onended is a function
            originalOnEnded.call(audioRef.current);
          }
        };
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
      isPlayingRef.current = false;
      toast.error("Failed to play audio response");
      processingRef.current = false;
      // Try next queued response
      processNextQueuedResponse();
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      toast.success("Voice responses enabled");
      // Process any pending responses
      processNextQueuedResponse();
    } else {
      toast.info("Voice responses disabled");
      if (audioRef.current && (isSpeaking || isPlayingRef.current)) {
        audioRef.current.pause();
        setIsSpeaking(false);
        isPlayingRef.current = false;
        processingRef.current = false;
        // Clear queue when audio is disabled
        responseQueueRef.current = [];
      }
    }
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

    try {
      // Call chat function
      const { data: chatData, error: chatError } = await supabase.functions.invoke('chat', {
        body: { 
          message: text,
          conversationId,
          contactContext
        }
      });

      if (chatError) {
        console.error('Error calling chat function:', chatError);
        toast.error("Failed to get a response. Please try again.");
        const errorMessage = { 
          sender: "jarvis", 
          text: "Sorry, I encountered an error processing your request. Please try again." 
        };
        setMessages((prev) => [...prev, errorMessage]);
        processingRef.current = false;
      } else {
        const botResponse = chatData.response;
        const botMessage = { sender: "jarvis", text: botResponse };
        setMessages((prev) => [...prev, botMessage]);
        
        // Update conversation ID if returned from backend
        if (chatData.conversationId) {
          setConversationId(chatData.conversationId);
        }
        
        // Speak response if audio is enabled
        if (audioEnabled) {
          // If already speaking, queue this response
          if (isSpeaking || isPlayingRef.current) {
            responseQueueRef.current.push({ text: botResponse });
          } else {
            await speakText(botResponse);
          }
        } else {
          processingRef.current = false;
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
      processingRef.current = false;
    }
    
    // Reset state
    setIsLoading(false);
    setInput("");
    setVoiceProcessing(false);
    if (!audioEnabled) {
      processingRef.current = false;
    }
  };

  return (
    <Card className="border-slate-700 shadow-lg bg-gradient-to-b from-slate-800 to-slate-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-xl flex items-center gap-2">
              Jarvis Assistant
              <Badge variant="outline" className="ml-2 bg-blue-900/30 text-blue-400 border-blue-500/20">
                AI Powered
              </Badge>
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <AudioToggle 
              audioEnabled={audioEnabled} 
              toggleAudio={toggleAudio} 
            />
            <VoiceRecognition 
              isListening={isListening}
              setIsListening={setIsListening}
              isSpeaking={isSpeaking}
              onTranscriptFinalized={processVoiceInput}
              disabled={isLoading || voiceProcessing || (isSpeaking && isListening)}
            />
          </div>
        </div>

        {contactContext && (
          <div className="mt-2 p-2 border border-blue-500/20 rounded-md bg-blue-950/20 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span className="text-blue-300">Contact Context Active</span>
              </div>
              <span className="text-blue-400 font-medium">{contactContext.name}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="secondary" className="bg-slate-700/50 text-xs">
                {contactContext.stage}
              </Badge>
              {contactContext.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-slate-700/50">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <MessageList 
          messages={messages} 
          isSpeaking={isSpeaking} 
        />
        
        <div className="flex flex-col sm:flex-row gap-2">
          <InputArea 
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isDisabled={isLoading || voiceProcessing}
          />
          <div className="flex gap-2 md:hidden">
            {!isMobile && (
              <VoiceRecognition 
                isListening={isListening}
                setIsListening={setIsListening}
                isSpeaking={isSpeaking}
                onTranscriptFinalized={processVoiceInput}
                disabled={isLoading || voiceProcessing || (isSpeaking && isListening)}
              />
            )}
          </div>
        </div>
        
        {/* Conversation ID indicator */}
        {conversationId && (
          <div className="mt-2 text-xs text-slate-500 text-right">
            Conversation ID: {conversationId.slice(0, 8)}...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatBot;
