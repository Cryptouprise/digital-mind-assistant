
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
          {liveTranscript || "Live transcription will appear here..."}
        </p>
      )}
    </div>
  );
};

export default LiveTranscription;
