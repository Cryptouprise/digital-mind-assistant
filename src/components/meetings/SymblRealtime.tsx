
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, WifiOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// This is a placeholder for the Symbl SDK that will be used in the real implementation
const SYMBL_SDK_LOADED = false;

interface SymblRealtimeProps {
  meetingId?: string;
}

export const SymblRealtime: React.FC<SymblRealtimeProps> = ({ meetingId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!SYMBL_SDK_LOADED) {
      console.warn('Symbl SDK not loaded yet. This is a placeholder component.');
    }
  }, []);

  const handleStartMeeting = () => {
    setIsLoading(true);
    
    // This is a placeholder - in the real implementation we would use the Symbl SDK
    setTimeout(() => {
      toast({
        title: "Symbl SDK Integration Coming Soon",
        description: "This feature is currently under development. Check back later!",
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleStopMeeting = () => {
    setIsLoading(true);
    
    // This is a placeholder - in the real implementation we would use the Symbl SDK
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(false);
      toast({
        title: "Meeting Ended",
        description: "The live meeting has ended and your insights have been saved.",
      });
    }, 1000);
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
          ) : (
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={isLoading || !SYMBL_SDK_LOADED}
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
        {!SYMBL_SDK_LOADED ? (
          <div className="p-4 text-center">
            <WifiOff className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400">Symbl Real-Time Intelligence is coming soon!</p>
            <p className="text-gray-500 text-sm mt-1">This feature will provide live meeting transcriptions and insights.</p>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-md">
              <p className="text-gray-300 text-sm">Live transcription will appear here...</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Real-Time Insights</h3>
              {insights.length === 0 ? (
                <p className="text-gray-500 text-sm">No insights detected yet...</p>
              ) : (
                <ul className="space-y-1">
                  {insights.map((insight, i) => (
                    <li key={i} className="text-sm bg-slate-700 p-2 rounded">{insight}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-400">Start a meeting to begin capturing real-time insights.</p>
            <p className="text-gray-500 text-sm mt-1">Click the "Start Meeting" button to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SymblRealtime;
