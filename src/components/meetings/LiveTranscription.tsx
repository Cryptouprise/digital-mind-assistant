
import React, { useEffect, useState, useRef } from 'react';
import { Loader2, WifiOff, Search, ArrowDownCircle, User, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  
  // New Symbl-inspired UI colors
  const colors = {
    primary: "#3584e4",
    secondary: "#9141ac",
    success: "#2ec27e",
    warning: "#f5c211",
    danger: "#e01b24",
    neutral: "#5e5c64"
  };
  
  // Sample speakers for demo - in production this would come from Symbl API
  const speakers: Speaker[] = [
    { id: "s1", name: "Jenny Jain", color: colors.primary },
    { id: "s2", name: "Bill Wayne", color: colors.danger },
    { id: "s3", name: "Gary Hudson", color: colors.success }, 
    { id: "s4", name: "Karam Khan", color: colors.secondary },
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
    if (autoScroll && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [filteredMessages, autoScroll]);

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border border-dashed border-slate-700 shadow-lg">
        <WifiOff className="h-12 w-12 mx-auto mb-4 text-slate-500 animate-pulse" />
        <h3 className="text-xl font-medium text-slate-300 mb-3">No Active Meeting</h3>
        <p className="text-slate-400 mb-4 max-w-md mx-auto">Start a meeting to begin capturing real-time transcription, insights, and analytics powered by Symbl.ai</p>
        <Button variant="outline" size="lg" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-500">
          Start New Meeting
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      {/* Search bar and controls with updated styling */}
      <div className="flex items-center gap-3 p-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search transcription..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-900 border-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-600">
            <input 
              type="checkbox" 
              id="auto-scroll" 
              className="mr-2 h-4 w-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500"
              checked={autoScroll}
              onChange={() => setAutoScroll(!autoScroll)}
            />
            <label htmlFor="auto-scroll" className="select-none">Auto Scroll</label>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10 border-slate-600 bg-slate-800 hover:bg-slate-700"
            onClick={() => {
              if (transcriptContainerRef.current) {
                transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
              }
            }}
          >
            <ArrowDownCircle className="h-4 w-4 text-blue-400" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        </div>
      </div>

      {/* Transcript content */}
      <div 
        ref={transcriptContainerRef}
        className="max-h-[400px] overflow-y-auto p-4 space-y-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-400" />
            <span className="text-slate-300 font-medium text-lg">Capturing audio...</span>
            <p className="text-slate-400 text-sm mt-2">Processing meeting transcription with Symbl.ai</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, idx) => {
                const speaker = speakers.find(s => s.id === message.speakerId) || speakers[0];
                const isHighlighted = idx === highlightedMessageId;
                
                return (
                  <div 
                    key={idx} 
                    className={`pb-4 transition-all duration-200 ${
                      isHighlighted ? 'bg-slate-800/80 rounded-lg p-3 -m-3 ring-1 ring-blue-500/50' : ''
                    }`}
                    onClick={() => setHighlightedMessageId(isHighlighted ? null : idx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="relative">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center" 
                            style={{ backgroundColor: `${speaker.color}30` }}
                          >
                            <User className="h-4 w-4" style={{ color: speaker.color }} />
                          </div>
                        </div>
                        <span className="ml-2 font-medium" style={{ color: speaker.color }}>
                          {speaker.name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{message.timestamp}</span>
                        {isHighlighted ? 
                          <ChevronUp className="h-4 w-4 ml-2 text-slate-500" /> : 
                          <ChevronDown className="h-4 w-4 ml-2 text-slate-500" />
                        }
                      </div>
                    </div>
                    
                    <div 
                      className="ml-10 pl-4 border-l-2 rounded-md py-2" 
                      style={{ borderColor: speaker.color }}
                    >
                      <p className="text-slate-200 text-base whitespace-pre-line leading-relaxed">
                        {searchTerm ? (
                          <>
                            {message.text.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                              part.toLowerCase() === searchTerm.toLowerCase() ? 
                              <mark key={i} className="bg-yellow-500/30 text-yellow-200 px-1 rounded">{part}</mark> : 
                              part
                            )}
                          </>
                        ) : message.text}
                      </p>
                      
                      {isHighlighted && (
                        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 py-0 text-xs bg-transparent">
                              Share
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 py-0 text-xs bg-transparent">
                              Copy
                            </Button>
                          </div>
                          <div className="text-xs text-blue-400">Click to collapse</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : !liveTranscript ? (
              <div className="text-center py-16 px-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Waiting for speech to transcribe...</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  When someone speaks, Symbl.ai will automatically transcribe the conversation in real-time.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <Search className="h-6 w-6 mx-auto mb-3 text-slate-500" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
                <p className="text-slate-400 text-sm">
                  No transcripts matching "{searchTerm}" were found
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscription;
