
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Meeting } from "@/utils/symblClient";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileText, Tag } from 'lucide-react';

interface MeetingSummariesProps {
  meetings: Meeting[];
}

const MeetingSummaries = ({ meetings }: MeetingSummariesProps) => {
  // Filter for completed meetings with summaries
  const meetingsWithSummaries = meetings.filter(m => m.summary && m.status === 'completed');
  
  if (meetings.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-400" />
        Meeting Summaries
      </h2>
      
      {meetingsWithSummaries.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700 text-white p-6 text-center">
          <div className="flex flex-col items-center justify-center py-6">
            <FileText className="h-10 w-10 text-gray-500 mb-2" />
            <p className="text-gray-400">No meeting summaries available yet</p>
            <p className="text-sm text-gray-500 mt-1">
              {meetings.some(m => m.status === 'processing') 
                ? 'Your meetings are still being processed. Summaries will appear here when ready.' 
                : 'Upload a meeting recording to generate summaries and insights.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 mb-6">
          {meetingsWithSummaries.map((meeting) => (
            <Card key={meeting.id} className="bg-slate-800 border-slate-700 text-white">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-semibold">{meeting.title || 'Untitled Meeting'}</CardTitle>
                    <CardDescription className="text-gray-400 flex items-center gap-1 mt-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  
                  {meeting.tags && meeting.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {meeting.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-slate-700 text-xs border-slate-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-2 bg-slate-700" />
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">SUMMARY</h4>
                  <div className="text-gray-300 whitespace-pre-line">{meeting.summary}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingSummaries;
