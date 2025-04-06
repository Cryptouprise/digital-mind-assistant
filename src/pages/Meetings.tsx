
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Upload, RefreshCcw } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { fetchMeetings, uploadMeetingAudio } from "@/utils/symblClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";

interface Meeting {
  id: string;
  title: string;
  date: string;
  summary: string;
  status?: string;
  symbl_conversation_id?: string;
}

const Meetings = () => {
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { 
    data: meetings = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['meetings'],
    queryFn: fetchMeetings,
    refetchInterval: 30000, // Refetch every 30 seconds to check for updates
  });

  const handleUpload = async () => {
    if (!audioUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid audio URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadMeetingAudio(audioUrl);
      toast({
        title: "Success",
        description: "Meeting audio uploaded successfully. Processing will begin shortly.",
      });
      setAudioUrl("");
      refetch();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (error) {
    console.error("Error loading meetings:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">
      <Navigation darkTheme={true} />
      
      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold">Meeting Insights</h1>
          </div>
          <Link to="/" className="flex items-center text-blue-400 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-slate-800 border-slate-700 text-white mb-6">
          <CardHeader>
            <CardTitle>Upload Meeting Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter URL to meeting audio/video recording"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !audioUrl}
                className="flex items-center gap-2"
              >
                {isUploading ? 
                  <RefreshCcw className="h-4 w-4 animate-spin" /> : 
                  <Upload className="h-4 w-4" />
                }
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-400">
            Supported formats: MP4, MP3, WAV, and most audio/video formats
          </CardFooter>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Meeting Transcripts</span>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 flex items-center gap-1">
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
                  {meetings.map((meeting: Meeting) => (
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

        <div className="grid gap-6 mt-6">
          {meetings.map((meeting: Meeting) => (
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
      </main>
    </div>
  );
};

export default Meetings;
