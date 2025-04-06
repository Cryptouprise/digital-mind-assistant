
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Volume2 } from "lucide-react";

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
                className={`px-4 py-3 rounded-lg max-w-[80%] shadow-md transition-all duration-200 ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white" 
                    : isSpeaking && idx === messages.length - 1 
                      ? "bg-slate-700 text-slate-100 border border-green-500/30" 
                      : "bg-slate-700 text-slate-100"
                }`}
              >
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
