
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for the assistant");
      return;
    }
    
    setLoading(true);
    try {
      // Mock API call - replace with real implementation when backend is ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReply = `
Here's how to set up a new "Demo Booked" stage:

1. Go to the Pipeline Settings in GHL
2. Select the appropriate pipeline (usually "Sales Pipeline")
3. Click "Add Stage"
4. Enter "Demo Booked" as the stage name
5. Set the probability to 45%
6. Assign a blue color for visibility
7. Set default actions:
   - Send notification to account manager
   - Tag contact as "demo-scheduled"
8. Click Save

The stage has been added. Would you like me to create an automatic workflow for when contacts enter this stage?`;
      
      setReply(mockReply);
      toast.success("Assistant responded");
    } catch (error) {
      console.error("Assistant error:", error);
      toast.error("Failed to get assistant response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Jarvis Admin Assistant</h1>
      
      <div className="flex flex-col gap-4 mb-6">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Set up a new stage for Demo Booked"
          className="resize-none h-24 bg-slate-800 border-slate-700 text-white"
        />
        <Button 
          onClick={handleAsk} 
          className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto md:self-end"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Ask Admin Assistant
            </>
          )}
        </Button>
      </div>
      
      {reply && (
        <Card className="p-6 whitespace-pre-wrap bg-slate-800 border-slate-700 text-white">
          {reply}
        </Card>
      )}
    </div>
  );
}
