
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const AudioToggle: React.FC<AudioToggleProps> = ({ audioEnabled, toggleAudio }) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleAudio} 
      title={audioEnabled ? "Disable voice responses" : "Enable voice responses"}
      className={`transition-colors duration-200 ${audioEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-slate-700/20"}`}
    >
      {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
};

export default AudioToggle;
