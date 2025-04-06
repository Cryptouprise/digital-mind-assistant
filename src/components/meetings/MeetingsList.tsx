
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Meeting } from "@/utils/symblClient";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  onRefresh: () => void;
}

const MeetingsList = ({ meetings, isLoading, onRefresh }: MeetingsListProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Meeting Transcripts</span>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 flex items-center gap-1">
            <RefreshCcw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No meetings found. Upload a recording to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id} className="hover:bg-slate-700">
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'completed' ? 'bg-green-900 text-green-100' : 'bg-amber-900 text-amber-100'
                    }`}>
                      {meeting.status || 'Processing'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingsList;
