
import React, { useState, useEffect } from "react";
import ChatBot from "@/components/ChatBot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Calendar, Mic, Video, Link as LinkIcon, ArrowRight } from "lucide-react";
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
    <div className="flex-1 bg-slate-900 text-white pb-4 pt-4 md:pt-6 px-4">
      <ScrollArea className="h-[calc(100vh-64px)] w-full">
        <div className="container py-4 max-w-5xl mx-auto">
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
          <div className="mb-6 bg-slate-800/60 rounded-lg p-4 border border-slate-700 hover:border-blue-600 transition-colors">
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
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600 sm:flex-grow-0 flex-grow"
                  onClick={handleViewMeetings}
                >
                  <Video className="mr-2 h-4 w-4" />
                  View Meetings
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleStartMeeting}
                  className="sm:flex-grow-0 flex-grow"
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Join Zoom Meeting
                </Button>
              </div>
            </div>
            
            {/* Symbl.ai Feature Highlight */}
            <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-700/50 p-3 rounded flex items-start">
                <div className="rounded-full bg-blue-500/20 p-2 mr-3 mt-1">
                  <Mic className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Real-time Transcription</h3>
                  <p className="text-xs text-slate-400 mt-1">Get accurate meeting transcriptions as you speak</p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded flex items-start">
                <div className="rounded-full bg-indigo-500/20 p-2 mr-3 mt-1">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Meeting Insights</h3>
                  <p className="text-xs text-slate-400 mt-1">Automatically detect action items and follow-ups</p>
                </div>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded flex items-start">
                <div className="rounded-full bg-purple-500/20 p-2 mr-3 mt-1">
                  <Video className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Zoom Integration</h3>
                  <p className="text-xs text-slate-400 mt-1">Seamlessly join meetings with built-in analysis</p>
                </div>
              </div>
            </div>
            
            {/* Explore All Features Button */}
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={handleViewMeetings} 
                className="text-blue-400 hover:text-blue-300"
              >
                Explore all meeting features <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
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
