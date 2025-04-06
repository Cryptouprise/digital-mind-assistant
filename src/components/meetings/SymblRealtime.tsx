import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LiveTranscription from './LiveTranscription';
import InsightsList from './InsightsList';
import MeetingControls from './MeetingControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MessageSquare, Lightbulb, Volume2 } from 'lucide-react';

// Simulated insights for development/demo purposes
const mockInsights = [
  "Consider increasing pricing by 10% to align with market value",
  "Customer showed interest in the premium tier features",
  "Follow up needed regarding implementation timeline",
  "Client mentioned budget concerns about the enterprise plan"
];

interface SymblRealtimeProps {
  meetingId?: string;
}

export const SymblRealtime: React.FC<SymblRealtimeProps> = ({ meetingId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [transcription, setTranscription] = useState<string>("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("transcription");
  const { toast } = useToast();
  const symblTokenRef = useRef<string | null>(null);

  // Initialize Symbl API token when component mounts
  useEffect(() => {
    const initializeSymbl = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('symbl-client', {
          body: {
            action: 'initRealtime'
          }
        });
        
        if (error) {
          console.error("Error initializing Symbl:", error);
          return;
        }
        
        if (data?.token) {
          symblTokenRef.current = data.token;
          console.log("Symbl token initialized successfully");
        }
      } catch (err) {
        console.error("Failed to initialize Symbl:", err);
      }
    };
    
    initializeSymbl();
    
    return () => {
      // Cleanup if necessary
      if (isConnected) {
        handleStopMeeting();
      }
    };
  }, []);

  // Simulated function to start a meeting with Symbl
  const handleStartMeeting = async () => {
    setIsLoading(true);
    
    try {
      if (!symblTokenRef.current) {
        // Try to initialize token again if missing
        const { data, error } = await supabase.functions.invoke('symbl-client', {
          body: {
            action: 'initRealtime'
          }
        });
        
        if (error || !data?.token) {
          throw new Error("Could not initialize Symbl token");
        }
        
        symblTokenRef.current = data.token;
      }
      
      // For now, simulate starting a meeting
      // In a full implementation, this would connect to Symbl's WebSocket API
      
      // Generate a mock conversation ID (this would come from Symbl in the real implementation)
      const mockConversationId = `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setConversationId(mockConversationId);
      
      setTimeout(() => {
        setIsConnected(true);
        setIsLoading(false);
        
        // Add mock insights gradually
        let currentInsights: string[] = [];
        const insightInterval = setInterval(() => {
          if (currentInsights.length < mockInsights.length) {
            const newInsight = mockInsights[currentInsights.length];
            currentInsights = [...currentInsights, newInsight];
            setInsights(currentInsights);
            
            // Also update transcription
            setTranscription(prev => 
              prev + (prev ? "\n\n" : "") + "Speaker: " + 
              ["Let's discuss pricing options.", 
               "I think the premium tier could work for us.",
               "What's the implementation timeline?",
               "We need to consider our budget constraints."][currentInsights.length - 1]
            );
          } else {
            clearInterval(insightInterval);
          }
        }, 3000);
        
        toast({
          title: "Meeting Started",
          description: "You are now capturing live meeting insights.",
        });
      }, 2000);
      
    } catch (err) {
      console.error("Error starting meeting:", err);
      setIsLoading(false);
      
      toast({
        title: "Failed to Start Meeting",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Simulated function to stop a meeting
  const handleStopMeeting = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(false);
      
      toast({
        title: "Meeting Ended",
        description: "The live meeting has ended and your insights have been saved.",
      });
      
      // Don't clear insights and transcription to let user see and save them
    }, 1000);
  };
  
  // Function to save meeting data to Supabase
  const handleSaveSession = async () => {
    if (!conversationId) {
      toast({
        title: "Cannot Save Session",
        description: "No conversation ID found. Please start a meeting first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('symbl-client', {
        body: {
          action: 'saveRealtimeSession',
          conversationId
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Meeting Saved",
        description: "Your meeting data has been saved successfully.",
      });
      
      // Clear state after saving
      setTranscription("");
      setInsights([]);
      setConversationId(null);
      
    } catch (err) {
      console.error("Error saving meeting:", err);
      toast({
        title: "Failed to Save Meeting",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white mb-6 overflow-hidden shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-900 to-slate-800 border-b border-slate-700">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Live Meeting Intelligence</span>
            {isConnected ? (
              <Badge variant="outline" className="bg-green-900 text-green-100 border-green-500 animate-pulse">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                Disconnected
              </Badge>
            )}
          </div>
          
          <MeetingControls 
            isConnected={isConnected}
            isLoading={isLoading}
            isSaving={isSaving}
            onStartMeeting={handleStartMeeting}
            onStopMeeting={handleStopMeeting}
            onSaveSession={handleSaveSession}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {isConnected ? (
          <Tabs defaultValue="transcription" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-900 p-0 rounded-none sticky top-0 z-10">
              <TabsTrigger 
                value="transcription" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white py-3 text-slate-300"
              >
                <Mic className="h-4 w-4 mr-2" />
                Transcription
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white py-3 text-slate-300"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger 
                value="speakers" 
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white py-3 text-slate-300"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Speakers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcription" className="p-0">
              <LiveTranscription 
                isConnected={isConnected}
                transcription={transcription}
                isLoading={isLoading && isConnected}
              />
            </TabsContent>
            
            <TabsContent value="insights" className="p-0">
              <InsightsList insights={insights} />
            </TabsContent>
            
            <TabsContent value="speakers" className="p-0">
              <div className="bg-slate-900/60 rounded-md p-4 m-4">
                <h3 className="text-sm font-medium mb-2">Speaker Identification</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-md">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-white">John Doe</span>
                    <span className="text-xs text-slate-400 ml-auto">5 min 23s</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-md">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-white">Jane Smith</span>
                    <span className="text-xs text-slate-400 ml-auto">3 min 10s</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-md">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-white">Unknown Speaker</span>
                    <span className="text-xs text-slate-400 ml-auto">1 min 45s</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4">
            <LiveTranscription 
              isConnected={isConnected}
              transcription={transcription}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {conversationId && (
          <div className="px-4 py-2 bg-slate-900 text-center border-t border-slate-700">
            <p className="text-xs text-gray-500">Conversation ID: {conversationId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SymblRealtime;
