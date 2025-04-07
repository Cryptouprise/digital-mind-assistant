
import React from 'react';
import { useJarvisChat } from "@/hooks/useJarvisChat";
import JarvisHeader from "./jarvis/JarvisHeader";
import JarvisSuggestions from "./jarvis/JarvisSuggestions";
import MeetingSummaryCard from "./jarvis/MeetingSummaryCard";
import JarvisChatLog from "./jarvis/JarvisChatLog";
import JarvisChatForm from "./jarvis/JarvisChatForm";

export default function JarvisChat() {
  const {
    input,
    setInput,
    chatLog,
    loading,
    branding,
    handleSubmit,
    handlePlayAudio
  } = useJarvisChat();

  return (
    <div className="p-4 h-full flex flex-col">
      <JarvisHeader branding={branding} />
      
      <JarvisSuggestions onSuggestionClick={(suggestion) => setInput(suggestion)} />
      
      <MeetingSummaryCard onPlayAudio={handlePlayAudio} />

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <JarvisChatLog chatLog={chatLog} />
      </div>

      <JarvisChatForm
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
