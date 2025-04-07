
import React from 'react';
import { Card } from "@/components/ui/card";
import { PlayIcon } from "lucide-react";

interface MeetingSummaryCardProps {
  onPlayAudio: () => void;
}

const MeetingSummaryCard: React.FC<MeetingSummaryCardProps> = ({ onPlayAudio }) => {
  return (
    <Card className="p-4 mb-6 shadow-md bg-slate-800 border-slate-700 text-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Last Meeting Summary</h3>
        <button 
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center" 
          onClick={onPlayAudio}>
          <PlayIcon className="mr-1" size={16} /> Play Recording
        </button>
      </div>
      <p className="text-slate-300">Key points: Objections, product interest, next steps</p>
    </Card>
  );
};

export default MeetingSummaryCard;
