
import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';

interface LiveTranscriptionProps {
  isConnected: boolean;
  transcription: string;
  isLoading?: boolean;
}

const LiveTranscription = ({ isConnected, transcription, isLoading }: LiveTranscriptionProps) => {
  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <WifiOff className="h-8 w-8 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400">Start a meeting to begin capturing real-time insights.</p>
        <p className="text-gray-500 text-sm mt-1">Click the "Start Meeting" button to begin.</p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-900 rounded-md max-h-40 overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-gray-400">Capturing audio...</span>
        </div>
      ) : (
        <p className="text-gray-300 text-sm whitespace-pre-line">
          {transcription || "Live transcription will appear here..."}
        </p>
      )}
    </div>
  );
};

export default LiveTranscription;
