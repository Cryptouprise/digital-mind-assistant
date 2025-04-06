
import React, { useState, useEffect } from "react";
import ChatBot from "@/components/ChatBot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar, Mic, Video, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import JoinMeetingModal from "@/components/meetings/JoinMeetingModal";

const Chat = () => {
  const [showHint, setShowHint] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 8000); // Hide hint after 8 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleViewMeetings = () => {
    toast({
      title: "Navigating to Meetings",
      description: "Opening the meetings dashboard for you"
    });
    navigate("/meetings");
  };
  
  const handleStartMeeting = () => {
    setShowJoinModal(true);
  };
  
  const handleJoinMeeting = (meetingUrl: string, displayName: string, symblToken: string) => {
    // Navigate to meetings page and pass meeting details through state
    navigate("/meetings", { 
      state: { 
        activeZoomMeeting: { 
          url: meetingUrl, 
          displayName, 
          symblToken 
        }
      }
    });
    
    toast({
      title: "Starting Meeting",
      description: "Opening Zoom with Symbl.ai integration"
    });
  };
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 text-white">
      <ScrollArea className="h-[calc(100vh-64px)] w-full touch-scroll">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Jarvis Assistant
              </span>
              <span className="ml-2 text-sm font-normal bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                Voice Enabled
              </span>
            </h1>
            
            {showHint && (
              <div className="text-sm bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-md animate-pulse">
                Click the microphone icon to start voice conversation
              </div>
            )}
          </div>
          
          {/* Meeting Quick Access Panel */}
          <div className="mb-6 bg-slate-800/60 rounded-lg p-4 border border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                  Meeting Intelligence
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Join Zoom meetings with real-time transcription and insights powered by Symbl.ai
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  onClick={handleViewMeetings}
                >
                  <Video className="mr-2 h-4 w-4" />
                  View Meetings
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleStartMeeting}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Join Zoom Meeting
                </Button>
              </div>
            </div>
          </div>
          
          <ChatBot />
        </div>
      </ScrollArea>
      
      <JoinMeetingModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinMeeting}
      />
    </div>
  );
};

export default Chat;
