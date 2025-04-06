
import React, { useEffect, useState } from 'react';
import { Loader2, WifiOff, Search, ArrowDownCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Speaker {
  id: string;
  name: string;
  color: string;
}

interface TranscriptMessage {
  speakerId: string;
  text: string;
  timestamp: string;
}

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
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample speakers for demo - in production this would come from Symbl API
  const speakers: Speaker[] = [
    { id: "s1", name: "Jenny Jain", color: "#3b82f6" },  // blue
    { id: "s2", name: "Bill Wayne", color: "#ef4444" },  // red
    { id: "s3", name: "Gary Hudson", color: "#10b981" }, // green  
    { id: "s4", name: "Karam Khan", color: "#8b5cf6" },  // purple
  ];
  
  // Parse transcription into structured format with speakers
  const parseTranscription = (text: string): TranscriptMessage[] => {
    if (!text) return [];
    
    const paragraphs = text.split("\n\n");
    return paragraphs.map((paragraph, idx) => {
      // Try to extract speaker name if format is "Speaker: text"
      const speakerMatch = paragraph.match(/^([^:]+):\s(.+)$/);
      
      if (speakerMatch) {
        // Find matching speaker or use first speaker as fallback
        const speakerName = speakerMatch[1].trim();
        const speaker = speakers.find(s => s.name.includes(speakerName)) || 
                        speakers[idx % speakers.length];
                        
        return {
          speakerId: speaker.id,
          text: speakerMatch[2].trim(),
          timestamp: formatTimestamp(idx)
        };
      } else {
        // If no speaker detected, rotate through speakers
        return {
          speakerId: speakers[idx % speakers.length].id,
          text: paragraph,
          timestamp: formatTimestamp(idx)
        };
      }
    });
  };
  
  // Helper function to generate timestamps (in real app, these would come from Symbl)
  const formatTimestamp = (idx: number): string => {
    const minutes = Math.floor(idx / 2);
    const seconds = (idx % 2) * 30;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Get parsed transcript messages
  const transcriptMessages = parseTranscription(liveTranscript);
  
  // Filter by search term if provided
  const filteredMessages = searchTerm 
    ? transcriptMessages.filter(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : transcriptMessages;

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
                setLiveTranscript(prev => `${prev}\n\n${data.payload.content}`);
              }
            } else if (data.type === 'message_response') {
              if (data.messages?.length > 0) {
                const newMessages = data.messages.map((msg: any) => msg.payload.content).join('\n\n');
                setLiveTranscript(prev => `${prev}\n\n${newMessages}`);
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

  // Scroll to bottom when new messages arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      const transcriptContainer = document.getElementById('transcript-container');
      if (transcriptContainer) {
        transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
      }
    }
  }, [filteredMessages, autoScroll]);

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
    <div className="bg-slate-900 rounded-md overflow-hidden">
      {/* Search bar and controls */}
      <div className="flex items-center gap-2 p-2 bg-slate-800 border-b border-slate-700">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by keyword" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 bg-slate-900 border-slate-700 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-xs text-slate-400">
            <input 
              type="checkbox" 
              id="auto-scroll" 
              className="mr-1.5"
              checked={autoScroll}
              onChange={() => setAutoScroll(!autoScroll)}
            />
            <label htmlFor="auto-scroll">Auto Scroll</label>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => {
              const transcriptContainer = document.getElementById('transcript-container');
              if (transcriptContainer) {
                transcriptContainer.scrollTop = transcriptContainer.scrollHeight;
              }
            }}
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        </div>
      </div>

      {/* Transcript content */}
      <div 
        id="transcript-container"
        className="max-h-[300px] overflow-y-auto p-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin mr-3" />
            <span className="text-slate-300 font-medium">Capturing audio...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, idx) => {
                const speaker = speakers.find(s => s.id === message.speakerId) || speakers[0];
                return (
                  <div key={idx} className="pb-3">
                    <div className="flex items-center mb-1">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: speaker.color }}
                      />
                      <span className="text-sm font-medium" style={{ color: speaker.color }}>
                        {speaker.name}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
                        {message.timestamp}
                      </span>
                    </div>
                    <div className="pl-6 ml-1 border-l-2 rounded-md py-1" style={{ borderColor: speaker.color }}>
                      <p className="text-slate-300 text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : !liveTranscript ? (
              <div className="text-center py-8 text-slate-500">
                Waiting for speech to transcribe...
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscription;
