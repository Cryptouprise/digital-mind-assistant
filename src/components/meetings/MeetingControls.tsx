
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff, Save } from 'lucide-react';

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
  if (isConnected) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isSaving}
          onClick={onSaveSession}
          className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
        >
          {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span>Save</span>
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
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
      size="sm" 
      disabled={isLoading}
      onClick={onStartMeeting}
      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-medium"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mic className="h-3 w-3" />}
      <span>Start Meeting</span>
    </Button>
  );
};

export default MeetingControls;
