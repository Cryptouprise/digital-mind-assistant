
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import { ScrollArea } from "@/components/ui/scroll-area";

const Chat = () => {
  // Add hint message that disappears after a delay
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 8000); // Hide hint after 8 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <ScrollArea className="h-[calc(100vh-64px)] w-full touch-scroll">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Jarvis Assistant
              </span>
              <span className="ml-2 text-sm font-normal bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                Voice Enabled
              </span>
            </h1>
            
            {showHint && (
              <div className="text-sm bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md animate-pulse">
                Click the microphone icon to start voice conversation
              </div>
            )}
          </div>
          
          <ChatBot />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Chat;
