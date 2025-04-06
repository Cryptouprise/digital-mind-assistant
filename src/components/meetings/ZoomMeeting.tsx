
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

  // Extract meeting number from URL or use directly if it's an ID
  const extractMeetingNumber = (url: string): string => {
    if (url.includes('zoom.us/j/')) {
      const parts = url.split('zoom.us/j/');
      const meetingId = parts[1].split('?')[0];
      return meetingId;
    }
    return url.replace(/\D/g, ''); // Remove non-numeric characters
  };

  // Connect to Zoom meeting when component mounts
  useEffect(() => {
    const loadZoomSDK = async () => {
      try {
        // Check if SDK is loaded
        if (!window.ZoomMtg) {
          console.error("Zoom SDK not loaded. Please check if the SDK script is properly included in the HTML file.");
          toast({
            title: "Zoom SDK Not Found",
            description: "Could not initialize the meeting interface",
            variant: "destructive"
          });
          return;
        }
        
        // Initialize Zoom SDK with language and debug options
        window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
        window.ZoomMtg.preLoadWasm();
        window.ZoomMtg.prepareWebSDK();
        
        window.ZoomMtg.init({
          leaveUrl: window.location.origin,
          disableCORP: !window.crossOriginIsolated,
          success: () => {
            console.log("Zoom SDK initialized successfully");
            // Connect to meeting once SDK is initialized
            if (meetingUrl && displayName) {
              joinZoomMeeting();
            }
            
            // Connect to Symbl.ai
            connectToSymbl();
          },
          error: (error: any) => {
            console.error("Error initializing Zoom SDK:", error);
            toast({
              title: "Failed to initialize Zoom",
              description: "Could not set up the meeting interface",
              variant: "destructive"
            });
          }
        });
        
      } catch (error) {
        console.error("Error with Zoom SDK:", error);
        toast({
          title: "Zoom Integration Error",
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
      
      // Properly leave meeting on component unmount
      if (isJoined && window.ZoomMtg) {
        window.ZoomMtg.leaveMeeting({});
      }
    };
  }, []);
  
  // Connect to Symbl.ai realtime API
  const connectToSymbl = async () => {
    try {
      if (!symblToken) {
        throw new Error("Missing Symbl token");
      }
      
      // Use the actual Symbl.ai API
      const response = await fetch('https://api.symbl.ai/v1/realtime/insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${symblToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'meeting',
          meetingId: extractMeetingNumber(meetingUrl),
          config: {
            sentiment: true,
            meeting: {
              name: `Zoom Meeting ${extractMeetingNumber(meetingUrl)}`,
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Symbl API error: ${response.status}`);
      }
      
      const data = await response.json();
      setSymblConversationId(data.conversationId);
      setIsSymblConnected(true);
      
      console.log("Connected to Symbl.ai realtime API with conversation ID:", data.conversationId);
      
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
  
  const joinZoomMeeting = async () => {
    try {
      const meetingNumber = extractMeetingNumber(meetingUrl);
      
      if (!window.ZoomMtg) {
        throw new Error("Zoom SDK not loaded");
      }
      
      // For production: You need to get this from your server
      const apiKey = process.env.ZOOM_API_KEY || "YOUR_ZOOM_API_KEY"; 
      const meetingPassword = ''; // Optional: Add password if meeting requires it
      
      // In production, this should be requested from your server
      // The signature should be generated on the server side using your API secret
      const generateSignature = async (meetingNumber: string) => {
        try {
          const response = await fetch('/api/zoom-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              meetingNumber,
              role: 0  // 0 for attendee, 1 for host
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to generate signature');
          }
          
          const data = await response.json();
          return data.signature;
        } catch (error) {
          console.error("Error generating signature:", error);
          // Fallback for development only - REMOVE IN PRODUCTION
          // This is just for testing purposes
          return "GENERATED_SIGNATURE_PLACEHOLDER";
        }
      };
      
      const signature = await generateSignature(meetingNumber);
      
      // Join the Zoom meeting
      window.ZoomMtg.join({
        meetingNumber: meetingNumber,
        userName: displayName,
        signature: signature,
        apiKey: apiKey,
        passWord: meetingPassword,
        success: () => {
          console.log("Joined meeting successfully");
          setIsJoined(true);
          toast({
            title: "Meeting joined",
            description: `Connected to meeting as ${displayName}`
          });
          
          // Set up event listeners for Zoom meeting
          window.ZoomMtg.inMeetingServiceListener('onUserJoin', (data: any) => {
            console.log('User joined:', data);
          });
          
          window.ZoomMtg.inMeetingServiceListener('onUserLeave', (data: any) => {
            console.log('User left:', data);
          });
          
          window.ZoomMtg.inMeetingServiceListener('onMeetingStatus', (data: any) => {
            console.log('Meeting status:', data);
            if (data.meetingStatus === 3) { // Meeting ended
              handleEndMeeting();
            }
          });
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
    if (!window.ZoomMtg) return;
    
    window.ZoomMtg.mute({
      mute: !isMuted,
      success: () => {
        setIsMuted(!isMuted);
        toast({
          title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
          description: isMuted ? "Others can now hear you" : "You are now muted"
        });
      }
    });
  };

  const toggleVideo = () => {
    if (!window.ZoomMtg) return;
    
    window.ZoomMtg.videoOff({
      videoOff: !isVideoOff,
      success: () => {
        setIsVideoOff(!isVideoOff);
        toast({
          title: isVideoOff ? "Video Turned On" : "Video Turned Off",
          description: isVideoOff ? "Your camera is now active" : "Your camera is now off"
        });
      }
    });
  };

  const handleEndMeeting = async () => {
    try {
      if (isSymblConnected && symblConversationId) {
        // Save meeting data before ending
        await saveRealtimeMeeting(symblConversationId);
      }
      
      if (window.ZoomMtg) {
        window.ZoomMtg.leaveMeeting({
          success: () => {
            console.log("Left meeting successfully");
          }
        });
      }
      
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
          id="zmmtg-root"
        >
          {!isJoined && (
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
