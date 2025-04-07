
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface JarvisChatFormProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

const JarvisChatForm: React.FC<JarvisChatFormProps> = ({
  input,
  setInput,
  handleSubmit,
  loading
}) => {
  return (
    <form onSubmit={handleSubmit} className="mt-auto flex gap-2 items-end">
      <Textarea
        className="flex-grow bg-slate-800 border-slate-700 resize-none text-white placeholder:text-slate-400"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Jarvis anything..."
        rows={2}
      />
      <Button 
        type="submit" 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
};

export default JarvisChatForm;
