
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Meeting } from "@/utils/symblClient";
import { CalendarIcon } from 'lucide-react';

interface MeetingSummariesProps {
  meetings: Meeting[];
}

const MeetingSummaries = ({ meetings }: MeetingSummariesProps) => {
  // Filter for completed meetings with summaries
  const meetingsWithSummaries = meetings.filter(m => m.summary && m.status === 'completed');
  
  if (meetingsWithSummaries.length === 0) return null;
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Meeting Summaries</h2>
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
    </div>
  );
};

export default MeetingSummaries;
