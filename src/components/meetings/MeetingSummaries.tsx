
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp, FileText, Lightbulb } from "lucide-react";
import { getSymblToken } from "@/utils/symblClient";
import SymblWidget from '@/components/meetings/SymblWidget';

interface Meeting {
  id: string;
  title: string;
  date: string;
  status: string;
  summary?: string;
  symbl_conversation_id?: string;
}

interface MeetingSummariesProps {
  meetings: Meeting[];
}

const MeetingSummaries: React.FC<MeetingSummariesProps> = ({ meetings }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [symblToken, setSymblToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch Symbl token on component mount
    const fetchToken = async () => {
      try {
        const token = await getSymblToken();
        setSymblToken(token);
      } catch (error) {
        console.error("Failed to fetch Symbl token:", error);
      }
    };
    
    fetchToken();
  }, []);

  const toggleExpand = (meetingId: string) => {
    setExpanded(prev => ({
      ...prev,
      [meetingId]: !prev[meetingId]
    }));
  };

  const completedMeetings = meetings.filter(meeting => 
    meeting.status === 'completed' && (meeting.summary || meeting.symbl_conversation_id)
  );

  if (completedMeetings.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Meeting Summaries</h2>
      <div className="space-y-4">
        {completedMeetings.map(meeting => (
          <Card key={meeting.id} className="bg-slate-800 border-slate-700 text-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800 p-4 pb-2">
              <CardTitle className="text-lg font-medium flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span>{meeting.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleExpand(meeting.id)}
                  className="text-slate-300 hover:text-white hover:bg-blue-700/20"
                >
                  {expanded[meeting.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            
            {expanded[meeting.id] && (
              <CardContent className="p-4 pt-2">
                {meeting.summary ? (
                  <div className="space-y-4">
                    <div className="bg-slate-700 p-3 rounded-md">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                        Meeting Summary
                      </h3>
                      <p className="text-sm whitespace-pre-line text-slate-300">
                        {meeting.summary}
                      </p>
                    </div>
                    
                    {/* Render SymblWidget if we have a conversation ID and token */}
                    {meeting.symbl_conversation_id && symblToken && (
                      <SymblWidget 
                        accessToken={symblToken}
                        conversationId={meeting.symbl_conversation_id}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <span>No summary available yet</span>
                  </div>
                )}
                
                {/* Render SymblWidget even if there's no summary but we have conversation ID */}
                {!meeting.summary && meeting.symbl_conversation_id && symblToken && (
                  <SymblWidget 
                    accessToken={symblToken}
                    conversationId={meeting.symbl_conversation_id}
                  />
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MeetingSummaries;
