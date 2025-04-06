
import React from 'react';
import { RefreshCcw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Meeting } from "@/utils/symblClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const MeetingsList = ({ meetings, isLoading, error, onRefresh }: MeetingsListProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 text-white mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Meeting Transcripts</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isLoading}
            className="h-8 flex items-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCcw className="h-3 w-3" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-900/20 border-red-500 text-white">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-100">
              Error loading meetings: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <p>Loading meetings...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-gray-400">No meetings found.</p>
              <p className="text-sm text-gray-500">Upload a recording to get started.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">{meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} found</span>
            </div>
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
                    <TableCell className="font-medium">{meeting.title || 'Untitled Meeting'}</TableCell>
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
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-400">
        {meetings.length > 0 && "Meetings are processed by Symbl AI in the background. Refresh to check status."}
      </CardFooter>
    </Card>
  );
};

export default MeetingsList;
