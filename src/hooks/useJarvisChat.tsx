
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseJarvisCommand } from "@/utils/parseJarvisCommand";
import { jarvisActions } from "@/utils/jarvisActions";
import { ghlClient } from "@/utils/ghlClient";

export const useJarvisChat = () => {
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

  return {
    input,
    setInput,
    chatLog,
    loading,
    branding,
    handleSubmit,
    handlePlayAudio
  };
}
