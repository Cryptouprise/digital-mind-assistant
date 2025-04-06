
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Meeting } from "@/utils/symblClient";

interface MeetingSummariesProps {
  meetings: Meeting[];
}

const MeetingSummaries = ({ meetings }: MeetingSummariesProps) => {
  if (meetings.length === 0) return null;
  
  return (
    <div className="grid gap-6 mt-6">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="bg-slate-800 border-slate-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">{meeting.title}</CardTitle>
            <p className="text-sm text-gray-400">{new Date(meeting.date).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{meeting.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MeetingSummaries;
