
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volume2, MessageSquare, Bot, User } from "lucide-react";

interface Message {
  sender: string;
  text: string;
}

interface MessageListProps {
  messages: Message[];
  isSpeaking: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isSpeaking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="h-80 mb-4 p-2 rounded-md border bg-slate-900">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 py-8">
            <Bot className="h-12 w-12 mb-3 text-slate-500 opacity-60" />
            <p className="text-center">
              Send a message or speak to start a conversation with Jarvis.
            </p>
            <div className="mt-4 text-xs text-slate-500 max-w-xs text-center">
              Tip: Click the microphone icon to use voice commands. Try saying "What can you do?"
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-lg max-w-[80%] shadow-md transition-all duration-200 ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white" 
                    : isSpeaking && idx === messages.length - 1 
                      ? "bg-slate-700 text-slate-100 border border-green-500/30" 
                      : "bg-slate-700 text-slate-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {msg.sender === "user" 
                    ? <User className="h-4 w-4 text-blue-200" />
                    : <Bot className="h-4 w-4 text-green-300" />
                  }
                  <span className="text-xs opacity-75">
                    {msg.sender === "user" ? "You" : "Jarvis"}
                  </span>
                </div>
                
                <p className="text-base leading-relaxed font-medium">{msg.text}</p>
                
                {isSpeaking && idx === messages.length - 1 && msg.sender === "jarvis" && (
                  <div className="mt-1 text-xs text-green-300 flex items-center">
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
  );
};

export default MessageList;
