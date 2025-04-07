
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Save } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

interface MeetingControlsProps {
  isConnected: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onStartMeeting: () => void;
  onStopMeeting: () => void;
  onSaveSession: () => void;
}

const MeetingControls = ({ 
  isConnected, 
  isLoading, 
  isSaving, 
  onStartMeeting, 
  onStopMeeting, 
  onSaveSession 
}: MeetingControlsProps) => {
  const isMobile = useIsMobile();
  
  if (isConnected) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          disabled={isSaving}
          onClick={onSaveSession}
          className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span>Save</span>
        </Button>
        <Button 
          variant="destructive" 
          size={isMobile ? "sm" : "default"}
          disabled={isLoading}
          onClick={onStopMeeting}
          className="flex items-center gap-1"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MicOff className="h-3 w-3" />}
          <span>End</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      size={isMobile ? "sm" : "default"}
      disabled={isLoading}
      onClick={onStartMeeting}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-medium w-full sm:w-auto"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
      <span>Start Meeting</span>
    </Button>
  );
};

export default MeetingControls;
