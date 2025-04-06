
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface InputAreaProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => Promise<void>;
  isDisabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  sendMessage,
  isDisabled
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Jarvis..."
        disabled={isDisabled}
        className="flex-1 bg-slate-700 text-white border-slate-600 placeholder:text-slate-400"
      />
      <Button 
        onClick={sendMessage} 
        disabled={isDisabled || !input.trim()}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Send className="h-4 w-4 mr-2" />
        Send
      </Button>
    </div>
  );
};

export default InputArea;
