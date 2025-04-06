
import React from "react";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import { ScrollArea } from "@/components/ui/scroll-area";

const Chat = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <ScrollArea className="h-screen w-full">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <ChatBot />
        </div>
      </ScrollArea>
    </div>
  );
};

export default Chat;
