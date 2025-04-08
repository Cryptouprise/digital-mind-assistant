
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bell, 
  Terminal, 
  ZoomIn, 
  Wand2, 
  Radio, 
  Workflow, 
  Calendar,
  Tag, 
  BarChart4, 
  MessageCircle, 
  Cpu, 
  RefreshCcw,
  ClipboardList,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import VoiceRecognition from "@/components/chat/VoiceRecognition";
import { jarvisActions } from "@/utils/jarvisActions";
import { parseJarvisCommand } from "@/utils/parseJarvisCommand";
import { initSymblRealtime } from "@/utils/symblClient";

const CommandCenter = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [contactId, setContactId] = useState("");
  const [tagId, setTagId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [stageId, setStageId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [fields, setFields] = useState("");
  const [processingCommand, setProcessingCommand] = useState(false);
  
  // Visual feedback state
  const [commandHistory, setCommandHistory] = useState<{command: string, result: string, timestamp: Date}[]>([]);
  const [activeMeeting, setActiveMeeting] = useState<{id: string, status: string} | null>(null);

  const handleTranscriptFinalized = (text: string) => {
    setCommandInput(text);
    processCommand(text);
  };
  
  const processCommand = async (text: string) => {
    setProcessingCommand(true);
    
    try {
      // Parse the command using the existing utility
      const parsedCommand = parseJarvisCommand(text);
      
      if (parsedCommand) {
        toast.info(`Executing ${parsedCommand.action} command...`);
        
        let result = "Command processed successfully";
        
        switch (parsedCommand.action) {
          case 'add-tag':
            if (parsedCommand.contactId && parsedCommand.tagId) {
              await jarvisActions.addTag(parsedCommand.contactId, parsedCommand.tagId);
              result = `Tag ${parsedCommand.tagId} added to contact ${parsedCommand.contactId}`;
            }
            break;
            
          case 'launch-workflow':
            if (parsedCommand.contactId && parsedCommand.workflowId) {
              await jarvisActions.launchWorkflow(parsedCommand.workflowId, parsedCommand.contactId);
              result = `Workflow ${parsedCommand.workflowId} launched for contact ${parsedCommand.contactId}`;
            }
            break;
            
          case 'move-pipeline':
            if (parsedCommand.opportunityId && parsedCommand.stageId) {
              await jarvisActions.movePipelineStage(parsedCommand.opportunityId, parsedCommand.stageId);
              result = `Opportunity ${parsedCommand.opportunityId} moved to stage ${parsedCommand.stageId}`;
            }
            break;
            
          case 'mark-noshow':
            if (parsedCommand.appointmentId) {
              await jarvisActions.markNoShow(parsedCommand.appointmentId);
              result = `Appointment ${parsedCommand.appointmentId} marked as no-show`;
            }
            break;
            
          default:
            result = `Command type ${parsedCommand.action} not implemented yet`;
        }
        
        toast.success(result);
        setCommandHistory(prev => [{ command: text, result, timestamp: new Date() }, ...prev]);
      } else {
        // If no command was detected, give feedback
        toast.error("No valid command detected in the text");
        setCommandHistory(prev => [{ 
          command: text, 
          result: "No valid command detected", 
          timestamp: new Date() 
        }, ...prev]);
      }
    } catch (err) {
      console.error("Error executing command:", err);
      toast.error("Failed to execute command");
      setCommandHistory(prev => [{ 
        command: text, 
        result: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        timestamp: new Date() 
      }, ...prev]);
    } finally {
      setProcessingCommand(false);
    }
  };

  const handleManualCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    
    processCommand(commandInput);
  };

  const startRealtimeSession = async () => {
    try {
      toast.info("Starting Symbl.ai realtime session...");
      const { token } = await initSymblRealtime();
      
      setActiveMeeting({
        id: `meeting-${new Date().getTime()}`,
        status: 'active'
      });
      
      toast.success("Realtime session started! Token received.");
    } catch (err) {
      console.error("Failed to start realtime session:", err);
      toast.error("Failed to start Symbl.ai session. Check your credentials.");
    }
  };

  const handleDirectAction = async (actionType: string) => {
    setProcessingCommand(true);
    
    try {
      let result = "Action completed";
      
      switch(actionType) {
        case 'add-tag':
          if (!contactId || !tagId) {
            toast.error("Contact ID and Tag ID are required");
            return;
          }
          await jarvisActions.addTag(contactId, tagId);
          result = `Tag ${tagId} added to contact ${contactId}`;
          break;
          
        case 'launch-workflow':
          if (!contactId || !workflowId) {
            toast.error("Contact ID and Workflow ID are required");
            return;
          }
          await jarvisActions.launchWorkflow(workflowId, contactId);
          result = `Workflow ${workflowId} launched for contact ${contactId}`;
          break;
          
        case 'update-contact':
          if (!contactId || !fields) {
            toast.error("Contact ID and fields are required");
            return;
          }
          try {
            const fieldsObj = JSON.parse(fields);
            await jarvisActions.updateContact(contactId, fieldsObj);
            result = `Contact ${contactId} updated with new fields`;
          } catch (e) {
            toast.error("Invalid JSON for fields");
            return;
          }
          break;
          
        case 'move-pipeline':
          if (!opportunityId || !stageId) {
            toast.error("Opportunity ID and Stage ID are required");
            return;
          }
          await jarvisActions.movePipelineStage(opportunityId, stageId);
          result = `Opportunity ${opportunityId} moved to stage ${stageId}`;
          break;
          
        case 'mark-noshow':
          if (!appointmentId) {
            toast.error("Appointment ID is required");
            return;
          }
          await jarvisActions.markNoShow(appointmentId);
          result = `Appointment ${appointmentId} marked as no-show`;
          break;
      }
      
      toast.success(result);
      setCommandHistory(prev => [{ 
        command: `[UI Action] ${actionType}`, 
        result, 
        timestamp: new Date() 
      }, ...prev]);
    } catch (err) {
      console.error("Error executing action:", err);
      toast.error("Failed to execute action");
      setCommandHistory(prev => [{ 
        command: `[UI Action] ${actionType}`, 
        result: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        timestamp: new Date() 
      }, ...prev]);
    } finally {
      setProcessingCommand(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-6">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Terminal className="h-8 w-8 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Jarvis Command Center
              </span>
            </h1>
            <p className="text-slate-400 mt-1">Advanced control panel for Jarvis backend capabilities</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 border-blue-500 text-blue-400">
            Admin Access
          </Badge>
        </div>

        <Tabs defaultValue="voice" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="voice" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
              <Radio className="h-4 w-4 mr-2" />
              Voice Commands
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
              <Workflow className="h-4 w-4 mr-2" />
              Direct Actions
            </TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
              <ZoomIn className="h-4 w-4 mr-2" />
              Realtime Analytics
            </TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
              <Wand2 className="h-4 w-4 mr-2" />
              Automations
            </TabsTrigger>
          </TabsList>

          {/* Voice Commands Tab */}
          <TabsContent value="voice" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  Voice Command Interface
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Control Jarvis with natural language commands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualCommand} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <Textarea 
                        placeholder="Enter command or speak using the microphone button..."
                        className="bg-slate-900 border-slate-700 text-white h-32"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                      />
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-400 mb-2">Voice Input</p>
                        <VoiceRecognition
                          isListening={isListening}
                          setIsListening={setIsListening}
                          isSpeaking={isSpeaking}
                          onTranscriptFinalized={handleTranscriptFinalized}
                        />
                      </div>
                      <div className="w-full">
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={!commandInput.trim() || processingCommand}
                        >
                          Process Command
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Example Commands:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 p-2 rounded text-xs">
                      "Tag John123 as hotlead"
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded text-xs">
                      "Move John123 to stage Interested"
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded text-xs">
                      "Launch workflow welcome123 for contact John123"
                    </div>
                    <div className="bg-slate-700/50 p-2 rounded text-xs">
                      "Mark appointment appt456 as no-show"
                    </div>
                  </div>
                </div>

                {commandHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Command History:</h3>
                    <ScrollArea className="h-48 rounded-md border border-slate-700">
                      <div className="p-4 space-y-4">
                        {commandHistory.map((item, idx) => (
                          <div key={idx} className="border-l-2 border-blue-500 pl-3 py-1">
                            <div className="flex items-center gap-2">
                              <Terminal className="h-3 w-3 text-blue-400" />
                              <p className="text-xs font-medium text-slate-300">{item.command}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.result}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-400" />
                    Manage Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Contact ID</label>
                    <Input 
                      placeholder="e.g., contact_123" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Tag ID</label>
                    <Input 
                      placeholder="e.g., hot_lead" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={tagId}
                      onChange={(e) => setTagId(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleDirectAction('add-tag')}
                    className="w-full"
                    disabled={!contactId || !tagId || processingCommand}
                  >
                    Add Tag
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-green-400" />
                    Launch Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Contact ID</label>
                    <Input 
                      placeholder="e.g., contact_123" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Workflow ID</label>
                    <Input 
                      placeholder="e.g., onboarding_flow" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={workflowId}
                      onChange={(e) => setWorkflowId(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleDirectAction('launch-workflow')}
                    className="w-full"
                    variant="outline"
                    disabled={!contactId || !workflowId || processingCommand}
                  >
                    Launch Workflow
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-purple-400" />
                    Pipeline Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Opportunity ID</label>
                    <Input 
                      placeholder="e.g., opp_456" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={opportunityId}
                      onChange={(e) => setOpportunityId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Stage ID</label>
                    <Input 
                      placeholder="e.g., negotiation" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={stageId}
                      onChange={(e) => setStageId(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleDirectAction('move-pipeline')}
                    className="w-full"
                    variant="outline"
                    disabled={!opportunityId || !stageId || processingCommand}
                  >
                    Move Pipeline Stage
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-yellow-400" />
                    Appointment Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Appointment ID</label>
                    <Input 
                      placeholder="e.g., appt_789" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={appointmentId}
                      onChange={(e) => setAppointmentId(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleDirectAction('mark-noshow')}
                    className="w-full"
                    variant="outline"
                    disabled={!appointmentId || processingCommand}
                  >
                    Mark as No-Show
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-slate-800 border-slate-700 text-white md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-400" />
                    Update Contact Fields
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Update contact information using JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Contact ID</label>
                    <Input 
                      placeholder="e.g., contact_123" 
                      className="bg-slate-900 border-slate-700 text-white"
                      value={contactId}
                      onChange={(e) => setContactId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Fields (JSON)</label>
                    <Textarea 
                      placeholder='{
  "firstName": "John",
  "email": "john@example.com",
  "custom_field": "value"
}'
                      className="bg-slate-900 border-slate-700 text-white h-32 font-mono text-sm"
                      value={fields}
                      onChange={(e) => setFields(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleDirectAction('update-contact')}
                    className="w-full"
                    variant="outline"
                    disabled={!contactId || !fields || processingCommand}
                  >
                    Update Contact
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Realtime Analytics Tab */}
          <TabsContent value="realtime" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="h-5 w-5 text-blue-400" />
                  Symbl.ai Realtime Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Start a realtime transcription and analysis session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                  {activeMeeting ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center p-4 bg-green-900/30 rounded-full mb-4">
                        <Cpu className="h-12 w-12 text-green-400 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Meeting Analysis Active</h3>
                      <p className="text-sm text-green-400 animate-pulse mt-1">
                        ID: {activeMeeting.id}
                      </p>
                      <div className="grid grid-cols-4 gap-2 mt-6 max-w-md mx-auto">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className="h-2 w-full bg-blue-500/50 rounded animate-pulse"
                            style={{ 
                              animationDelay: `${i * 0.1}s`, 
                              height: `${Math.floor(Math.random() * 15) + 5}px` 
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="mt-8">
                        <Button 
                          variant="destructive"
                          onClick={() => setActiveMeeting(null)}
                        >
                          End Session
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-slate-900/50 rounded-full mb-4">
                          <ZoomIn className="h-12 w-12 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-white">Start Realtime Session</h3>
                        <p className="text-sm text-slate-400 max-w-md mt-2">
                          Begin a new Symbl.ai powered realtime transcription and analysis session for your meeting
                        </p>
                      </div>
                      <Button 
                        onClick={startRealtimeSession}
                        size="lg"
                        className="mt-4"
                      >
                        <Radio className="mr-2 h-4 w-4" />
                        Start New Session
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="mt-8 border-t border-slate-700 pt-6">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Features Available:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-slate-700/30 p-3 rounded flex items-start">
                      <div className="rounded-full bg-blue-900/20 p-2 mr-2">
                        <MessageCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Live Transcription</p>
                        <p className="text-xs text-slate-400 mt-1">Real-time speech to text</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 p-3 rounded flex items-start">
                      <div className="rounded-full bg-purple-900/20 p-2 mr-2">
                        <Lightbulb className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Topic Analysis</p>
                        <p className="text-xs text-slate-400 mt-1">Automatic topic detection</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 p-3 rounded flex items-start">
                      <div className="rounded-full bg-green-900/20 p-2 mr-2">
                        <ClipboardList className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Action Items</p>
                        <p className="text-xs text-slate-400 mt-1">Detect follow-up tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-400" />
                  Jarvis Automations
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure AI-powered automations for your meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-400" />
                        Automated Tagging
                      </h3>
                      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Automatically detect topics in conversations and apply tags to contacts
                    </p>
                    <Button variant="ghost" size="sm" className="text-blue-400">
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-purple-400" />
                        Smart Follow-ups
                      </h3>
                      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Generate and send personalized follow-up messages after meetings
                    </p>
                    <Button variant="ghost" size="sm" className="text-blue-400">
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-yellow-400" />
                        Pipeline Progression
                      </h3>
                      <Badge variant="outline" className="bg-slate-700 text-slate-400 border-slate-600">
                        Inactive
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Automatically move opportunities through pipeline stages based on conversation analysis
                    </p>
                    <Button variant="ghost" size="sm" className="text-blue-400">
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-md font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4 text-red-400" />
                        Alert Conditions
                      </h3>
                      <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Get notified when specific keywords or phrases are mentioned during meetings
                    </p>
                    <Button variant="ghost" size="sm" className="text-blue-400">
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommandCenter;
