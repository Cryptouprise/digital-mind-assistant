import { useState, useEffect } from 'react';
import { Send, Loader2, Sparkles, ClipboardList, Megaphone, PlayIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { parseJarvisCommand } from "@/utils/parseJarvisCommand";
import { jarvisActions } from "@/utils/jarvisActions";
import { ghlClient } from "@/utils/ghlClient";
import { Card } from "@/components/ui/card";

export default function JarvisChat() {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{ user: string; bot: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<{ company: string } | null>(null);

  useEffect(() => {
    supabase.from('settings').select('*')
      .eq('key', 'company_name')
      .single()
      .then(({ data, error }) => {
        if (data && !error) setBranding({ company: data.value });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    const userPrompt = input;
    setInput('');

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

      const response = data?.response || "No response received";

      const parsedCommand = parseJarvisCommand(response);
      
      if (parsedCommand) {
        executeJarvisCommand(parsedCommand);
      }

      setChatLog((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = response;
        return updated;
      });

      const { error: logError } = await supabase
        .from('ai_logs' as any)
        .insert({
          prompt: userPrompt,
          response: response
        } as any);
        
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

  const executeJarvisCommand = async (command: ReturnType<typeof parseJarvisCommand>) => {
    if (!command) return;
    
    try {
      toast.info(`Executing command: ${command.action}...`);
      
      switch (command.action) {
        case 'send-followup':
          if (command.contactId && command.message) {
            await ghlClient.sendFollowUp(command.contactId, command.message);
            toast.success(`Follow-up sent to contact ${command.contactId}`);
          }
          break;
          
        case 'add-tag':
          if (command.contactId && command.tagId) {
            await jarvisActions.addTag(command.contactId, command.tagId);
            toast.success(`Tag ${command.tagId} added to contact ${command.contactId}`);
          }
          break;

        case 'tag-contact':
          if (command.contactId && command.tag) {
            await jarvisActions.addTag(command.contactId, command.tag);
            toast.success(`Tagged contact ${command.contactId} as ${command.tag}`);
          }
          break;
          
        case 'move-pipeline':
          if (command.opportunityId && command.stageId) {
            await jarvisActions.movePipelineStage(command.opportunityId, command.stageId);
            toast.success(`Opportunity ${command.opportunityId} moved to stage ${command.stageId}`);
          }
          break;

        case 'move-stage':
          if (command.contactId && command.stage) {
            await jarvisActions.movePipelineStage(command.contactId, command.stage);
            toast.success(`Moved contact ${command.contactId} to stage ${command.stage}`);
          }
          break;
          
        case 'launch-workflow':
          if (command.contactId && command.workflowId) {
            await jarvisActions.launchWorkflow(command.workflowId, command.contactId);
            toast.success(`Workflow ${command.workflowId} launched for contact ${command.contactId}`);
          }
          break;
          
        case 'mark-noshow':
          if (command.appointmentId) {
            await jarvisActions.markNoShow(command.appointmentId);
            toast.success(`Appointment ${command.appointmentId} marked as no-show`);
          }
          break;
          
        case 'start-campaign':
          if (command.contactId && command.campaignName) {
            await ghlClient.launchWorkflow(command.campaignName, command.contactId);
            toast.success(`Campaign "${command.campaignName}" started for contact ${command.contactId}`);
          }
          break;
          
        default:
          console.log("Unknown command type:", command);
      }
    } catch (err) {
      console.error("Error executing command:", err);
      toast.error("Failed to execute command");
    }
  };

  const handlePlayAudio = () => {
    toast.info("Audio playback not yet implemented");
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 text-white">Jarvis Assistant</h2>
        <p className="text-sm text-slate-300">For {branding?.company || 'Your Business'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 shadow-md hover:shadow-lg cursor-pointer bg-slate-800 border-slate-700 text-white" 
              onClick={() => setInput('Generate a follow-up for the last meeting')}>
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-400" size={20} />
            <div>
              <p className="font-semibold">Smart Follow-Up</p>
              <p className="text-sm text-slate-300">AI-generated based on conversation history</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-md hover:shadow-lg cursor-pointer bg-slate-800 border-slate-700 text-white" 
              onClick={() => setInput('Summarize the last call with highlights')}>
          <div className="flex items-center gap-3">
            <ClipboardList className="text-blue-400" size={20} />
            <div>
              <p className="font-semibold">Summarize Call</p>
              <p className="text-sm text-slate-300">Objections, insights, and tone detected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 shadow-md hover:shadow-lg cursor-pointer bg-slate-800 border-slate-700 text-white" 
              onClick={() => setInput('Launch onboarding campaign for John123')}>
          <div className="flex items-center gap-3">
            <Megaphone className="text-blue-400" size={20} />
            <div>
              <p className="font-semibold">Launch Campaign</p>
              <p className="text-sm text-slate-300">Trigger automation from this panel</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6 shadow-md bg-slate-800 border-slate-700 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Last Meeting Summary</h3>
          <button 
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center" 
            onClick={handlePlayAudio}>
            <PlayIcon className="mr-1" size={16} /> Play Recording
          </button>
        </div>
        <p className="text-slate-300">Key points: Objections, product interest, next steps</p>
      </Card>

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
