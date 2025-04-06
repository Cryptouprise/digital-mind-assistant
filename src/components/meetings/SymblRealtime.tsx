
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, WifiOff, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// This will be replaced with actual integration once the Symbl SDK is loaded
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
    <Card className="bg-slate-800 border-slate-700 text-white mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Live Meeting Intelligence</span>
            {isConnected ? (
              <Badge variant="outline" className="bg-green-900 text-green-100 border-green-500">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                Disconnected
              </Badge>
            )}
          </div>
          
          {isConnected ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isSaving}
                onClick={handleSaveSession}
                className="flex items-center gap-1"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                <span>Save Session</span>
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={isLoading}
                onClick={handleStopMeeting}
                className="flex items-center gap-1"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MicOff className="h-3 w-3" />}
                <span>End Meeting</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={isLoading}
              onClick={handleStartMeeting}
              className="flex items-center gap-1"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
              <span>Start Meeting</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-md max-h-40 overflow-y-auto">
              <p className="text-gray-300 text-sm whitespace-pre-line">{transcription || "Live transcription will appear here..."}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Real-Time Insights</h3>
              {insights.length === 0 ? (
                <p className="text-gray-500 text-sm">No insights detected yet...</p>
              ) : (
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {insights.map((insight, i) => (
                    <li key={i} className="text-sm bg-slate-700 p-2 rounded">{insight}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <WifiOff className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400">Start a meeting to begin capturing real-time insights.</p>
            <p className="text-gray-500 text-sm mt-1">Click the "Start Meeting" button to begin.</p>
          </div>
        )}
        
        {conversationId && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-xs text-gray-500">Conversation ID: {conversationId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SymblRealtime;
