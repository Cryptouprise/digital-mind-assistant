
import React, { useEffect, useState } from 'react';
import { Loader2, WifiOff } from 'lucide-react';

interface LiveTranscriptionProps {
  isConnected: boolean;
  transcription: string;
  isLoading?: boolean;
  symblToken?: string;
  conversationId?: string;
}

const LiveTranscription = ({ 
  isConnected, 
  transcription, 
  isLoading, 
  symblToken,
  conversationId
}: LiveTranscriptionProps) => {
  const [liveTranscript, setLiveTranscript] = useState(transcription || '');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Connect to real-time WebSocket if we have a token and conversation ID
  useEffect(() => {
    if (isConnected && symblToken && conversationId) {
      try {
        // Connect to the real Symbl.ai WebSocket API
        const ws = new WebSocket(`wss://api.symbl.ai/v1/realtime/insights/${conversationId}?access_token=${symblToken}`);
        
        ws.onopen = () => {
          console.log('WebSocket connection established');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different message types from Symbl.ai
            if (data.type === 'transcript_response') {
              if (data.payload?.content) {
                setLiveTranscript(prev => `${prev}\n${data.payload.content}`);
              }
            } else if (data.type === 'message_response') {
              if (data.messages?.length > 0) {
                const newMessages = data.messages.map((msg: any) => msg.payload.content).join('\n');
                setLiveTranscript(prev => `${prev}\n${newMessages}`);
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
        
        setWsConnection(ws);
        
        return () => {
          ws.close();
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    }
  }, [isConnected, symblToken, conversationId]);

  // Update transcription when prop changes
  useEffect(() => {
    if (transcription && transcription !== liveTranscript) {
      setLiveTranscript(transcription);
    }
  }, [transcription]);

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-md border border-dashed border-slate-700">
        <WifiOff className="h-10 w-10 mx-auto mb-3 text-slate-500" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Meeting</h3>
        <p className="text-slate-400 mb-3 max-w-md mx-auto">Start a meeting to begin capturing real-time transcription, insights, and analytics powered by Symbl.ai</p>
        <div className="text-xs text-slate-500">Click the "Start Meeting" button above to begin</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-900 rounded-md max-h-[300px] overflow-y-auto">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin mr-3" />
          <span className="text-slate-300 font-medium">Capturing audio...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {liveTranscript.split("\n\n").map((paragraph, idx) => (
            <div key={idx} className="rounded-md bg-slate-800/60 p-3 border-l-2 border-blue-600">
              <p className="text-slate-300 text-sm whitespace-pre-line">
                {paragraph || "Waiting for speech..."}
              </p>
              <div className="text-right mt-1">
                <span className="text-xs text-slate-500">Just now</span>
              </div>
            </div>
          ))}
          
          {!liveTranscript && (
            <div className="text-center py-4 text-slate-500">
              Waiting for speech to transcribe...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTranscription;
