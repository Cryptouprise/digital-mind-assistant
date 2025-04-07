
import { useState } from 'react';
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function JarvisChat() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{ user: string; bot: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const userPrompt = input;
    setInput('');

    // Add user message immediately to improve UX
    setChatLog((prev) => [...prev, { user: userPrompt, bot: '...' }]);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userPrompt }
      });
      
      if (error) {
        toast.error("Error processing your request");
        setChatLog((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = "Sorry, I encountered an error processing your request.";
          return updated;
        });
        return;
      }

      // Update the last bot message with the actual response
      setChatLog((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = data?.response || "No response received";
        return updated;
      });

      // Log the conversation to the database
      const { error: logError } = await supabase
        .from('ai_logs')
        .insert({
          prompt: userPrompt,
          response: data?.response || "No response received"
        });
        
      if (logError) {
        console.error("Error logging conversation:", logError);
      }
    } catch (err) {
      console.error("Error in chat request:", err);
      setChatLog((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = "Something went wrong. Please try again.";
        return updated;
      });
      toast.error("Failed to connect to Jarvis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {chatLog.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            <p>Ask Jarvis anything to get started!</p>
          </div>
        ) : (
          chatLog.map((entry, idx) => (
            <div key={idx} className="space-y-2">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <p className="font-semibold text-blue-200 mb-1">You</p>
                <p className="text-white">{entry.user}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="font-semibold text-blue-200 mb-1">Jarvis</p>
                <p className="text-white whitespace-pre-wrap">{entry.bot}</p>
              </div>
            </div>
          ))
        )}
      </div>
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
    </div>
  );
}
