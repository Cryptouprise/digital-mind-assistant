
import React from 'react';
import { Sparkles, ClipboardList, Megaphone } from "lucide-react";
import SuggestionCard from "./SuggestionCard";

interface JarvisSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const JarvisSuggestions: React.FC<JarvisSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      icon: Sparkles,
      title: "Smart Follow-Up",
      description: "AI-generated based on conversation history",
      prompt: "Generate a follow-up for the last meeting"
    },
    {
      icon: ClipboardList,
      title: "Summarize Call",
      description: "Objections, insights, and tone detected",
      prompt: "Summarize the last call with highlights"
    },
    {
      icon: Megaphone,
      title: "Launch Campaign",
      description: "Trigger automation from this panel",
      prompt: "Launch onboarding campaign for John123"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          icon={suggestion.icon}
          title={suggestion.title}
          description={suggestion.description}
          onClick={() => onSuggestionClick(suggestion.prompt)}
        />
      ))}
    </div>
  );
};

export default JarvisSuggestions;
