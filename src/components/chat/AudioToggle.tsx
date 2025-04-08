
import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, HelpCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface AudioToggleProps {
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const AudioToggle: React.FC<AudioToggleProps> = ({ audioEnabled, toggleAudio }) => {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAudio} 
            className={`transition-colors duration-200 ${
              audioEnabled 
                ? "text-green-400 hover:bg-green-900/20 hover:text-green-300" 
                : "text-slate-400 hover:bg-slate-700/20"
            }`}
          >
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {audioEnabled ? "Voice responses enabled" : "Voice responses disabled"}
            <p className="text-xs text-slate-400 mt-1">Click to {audioEnabled ? "disable" : "enable"}</p>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-blue-400 hover:bg-blue-900/20"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <p className="font-medium">Chat Commands</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• "Send a follow-up to [contact]"</li>
              <li>• "Tag [contact] as [tag]"</li>
              <li>• "Move [contact] to [stage]"</li>
              <li>• "Launch workflow for [contact]"</li>
              <li>• "Mark appointment as no-show"</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default AudioToggle;
