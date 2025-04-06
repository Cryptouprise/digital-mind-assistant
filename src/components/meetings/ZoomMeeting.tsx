
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MicOff, Mic, Video, VideoOff, Phone } from "lucide-react";
import { saveRealtimeMeeting } from "@/utils/symblClient";

interface ZoomMeetingProps {
  meetingUrl: string;
  displayName: string;
  symblToken: string;
  onEndMeeting: () => void;
}

const ZoomMeeting: React.FC<ZoomMeetingProps> = ({ 
  meetingUrl, 
  displayName, 
  symblToken,
  onEndMeeting 
}) => {
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [symblConversationId, setSymblConversationId] = useState<string | null>(null);
  const [isSymblConnected, setIsSymblConnected] = useState(false);
  const { toast } = useToast();

  // Connect to Zoom meeting when component mounts
  useEffect(() => {
    const loadZoomSDK = async () => {
      try {
        // Load Zoom SDK (in a real implementation, you'd load the actual SDK)
        // This is a simplified example
        if (!window.ZoomMtg) {
          console.log("Loading Zoom SDK...");
          
          // In a real implementation, you would load the Zoom SDK:
          // const script = document.createElement('script');
          // script.src = 'https://source.zoom.us/zoom-meeting-2.9.5.min.js';
          // document.head.appendChild(script);
          
          // Simulate loading for demo
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate SDK being loaded
          window.ZoomMtg = {
            init: () => console.log("Zoom SDK initialized"),
            join: (params: any) => {
              console.log("Joining Zoom meeting with params:", params);
              setTimeout(() => {
                setIsJoined(true);
                toast({
                  title: "Meeting joined",
                  description: `Connected to meeting as ${displayName}`
                });
              }, 1500);
              return true;
            }
          };
        }
        
        // Initialize Zoom SDK
        if (window.ZoomMtg) {
          window.ZoomMtg.init();
        }
        
        // Connect to Symbl.ai
        connectToSymbl();
        
      } catch (error) {
        console.error("Error loading Zoom SDK:", error);
        toast({
          title: "Failed to load Zoom SDK",
          description: "Could not initialize the meeting interface",
          variant: "destructive"
        });
      }
    };
    
    loadZoomSDK();
    
    // Cleanup function
    return () => {
      if (isSymblConnected && symblConversationId) {
        // Save meeting data when unmounting if connected
        saveRealtimeMeeting(symblConversationId)
          .then(() => console.log("Meeting saved successfully"))
          .catch(err => console.error("Error saving meeting:", err));
      }
    };
  }, []);
  
  // Connect to Symbl.ai realtime API
  const connectToSymbl = async () => {
    try {
      if (!symblToken) {
        throw new Error("Missing Symbl token");
      }
      
      // In a real implementation, you would use the Symbl WebSocket API:
      // const symblConnection = new WebSocket(`wss://api.symbl.ai/v1/realtime/insights/${meetingId}?access_token=${symblToken}`);
      
      // Simulate Symbl connection for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fake conversation ID
      const mockConversationId = `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setSymblConversationId(mockConversationId);
      setIsSymblConnected(true);
      
      console.log("Connected to Symbl.ai realtime API with conversation ID:", mockConversationId);
      
      toast({
        title: "Symbl.ai Connected",
        description: "Meeting intelligence is now active"
      });
      
    } catch (error) {
      console.error("Error connecting to Symbl:", error);
      toast({
        title: "Symbl Connection Failed",
        description: "Could not connect to meeting intelligence service",
        variant: "destructive"
      });
    }
  };
  
  const joinZoomMeeting = () => {
    try {
      // Get meeting ID from URL or use directly if it's an ID
      const meetingId = meetingUrl.includes('zoom.us/j/') 
        ? meetingUrl.split('zoom.us/j/')[1].split('?')[0] 
        : meetingUrl;
      
      if (!window.ZoomMtg) {
        throw new Error("Zoom SDK not loaded");
      }
      
      // Join the Zoom meeting
      window.ZoomMtg.join({
        meetingNumber: meetingId,
        userName: displayName,
        // In a real implementation, you would need:
        // signature: "generated_signature",
        // apiKey: "your_zoom_api_key",
        // passWord: "meeting_password",
        success: () => {
          console.log("Joined meeting successfully");
          setIsJoined(true);
        },
        error: (err: any) => {
          console.error("Error joining meeting:", err);
          toast({
            title: "Failed to join meeting",
            description: "Could not connect to the Zoom meeting",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Failed to join meeting",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would call the Zoom SDK:
    // window.ZoomMtg?.mute({ mute: !isMuted });
    
    toast({
      title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
      description: isMuted ? "Others can now hear you" : "You are now muted"
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real implementation, you would call the Zoom SDK:
    // window.ZoomMtg?.videoOff({ videoOff: !isVideoOff });
    
    toast({
      title: isVideoOff ? "Video Turned On" : "Video Turned Off",
      description: isVideoOff ? "Your camera is now active" : "Your camera is now off"
    });
  };

  const handleEndMeeting = async () => {
    try {
      if (isSymblConnected && symblConversationId) {
        // Save meeting data before ending
        await saveRealtimeMeeting(symblConversationId);
      }
      
      // In a real implementation, you would leave the Zoom meeting:
      // window.ZoomMtg?.leaveMeeting({});
      
      toast({
        title: "Meeting Ended",
        description: "Your meeting data has been saved"
      });
      
      onEndMeeting();
    } catch (error) {
      console.error("Error ending meeting:", error);
      toast({
        title: "Error Ending Meeting",
        description: "There was a problem saving the meeting data",
        variant: "destructive"
      });
    }
  };

  // Effect to join the meeting when credentials are ready
  useEffect(() => {
    if (meetingUrl && displayName && !isJoined && window.ZoomMtg) {
      joinZoomMeeting();
    }
  }, [meetingUrl, displayName, window.ZoomMtg]);

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-400" />
            <span>Zoom Meeting</span>
            {isSymblConnected && (
              <span className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                Symbl Connected
              </span>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-slate-400">
          {isJoined ? `Joined as ${displayName}` : "Connecting to meeting..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Zoom meeting container */}
        <div 
          ref={zoomContainerRef}
          className="bg-black rounded-md overflow-hidden aspect-video mb-4 flex items-center justify-center"
        >
          {isJoined ? (
            isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-700">
                <div className="bg-slate-600 rounded-full p-8">
                  <Video className="h-12 w-12 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <p className="text-slate-400">
                  Video feed would appear here in a real implementation
                </p>
              </div>
            )
          ) : (
            <div className="animate-pulse flex flex-col items-center justify-center">
              <Video className="h-16 w-16 text-slate-600 mb-4" />
              <p className="text-slate-400">Connecting to Zoom...</p>
            </div>
          )}
        </div>

        {/* Meeting controls */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleMute}
            disabled={!isJoined}
            className="h-12 w-12 rounded-full"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVideo}
            disabled={!isJoined}
            className="h-12 w-12 rounded-full"
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndMeeting}
            className="h-12 w-12 rounded-full"
          >
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoomMeeting;
