
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Upload, RefreshCcw, KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { fetchMeetings, uploadMeetingAudio, Meeting } from "@/utils/symblClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { supabase } from "@/integrations/supabase/client";

const Meetings = () => {
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [symblAppId, setSymblAppId] = useState("");
  const [symblAppSecret, setSymblAppSecret] = useState("");
  const [credentialsSet, setCredentialsSet] = useState<boolean | null>(null);
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

  useEffect(() => {
    // Check if Symbl credentials are set
    const checkCredentials = async () => {
      const areSet = await checkSymblCredentials();
      setCredentialsSet(areSet);
      if (!areSet) {
        toast({
          title: "Symbl Credentials Required",
          description: "Please set your Symbl credentials to upload meeting recordings.",
          variant: "destructive",
        });
      }
    };
    
    checkCredentials();
  }, [toast]);

  const handleUpload = async () => {
    if (!audioUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid audio URL",
        variant: "destructive",
      });
      return;
    }

    if (!credentialsSet) {
      setCredentialsDialogOpen(true);
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

  const handleCredentialsSave = async () => {
    try {
      if (!symblAppId || !symblAppSecret) {
        toast({
          title: "Error",
          description: "Both App ID and App Secret are required",
          variant: "destructive",
        });
        return;
      }

      // Update the secrets in Supabase Edge Functions
      const { data, error } = await supabase.functions.invoke('update-secret-keys', {
        body: {
          keys: {
            symbl_app_id: symblAppId,
            symbl_app_secret: symblAppSecret,
          }
        }
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: "Success",
        description: "Symbl credentials saved successfully",
      });
      
      // Important: Check credentials again after saving
      const areSet = await checkSymblCredentials();
      setCredentialsSet(areSet);
      setCredentialsDialogOpen(false);
      setSymblAppId("");
      setSymblAppSecret("");
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save credentials",
        variant: "destructive",
      });
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

        {credentialsSet !== null && (
          <Card className={`mb-4 border ${credentialsSet ? 'border-green-500 bg-green-900/20' : 'border-orange-500 bg-orange-900/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {credentialsSet ? 
                  <><CheckCircle className="h-5 w-5 text-green-400" /> Symbl API Credentials Set</> : 
                  <><AlertCircle className="h-5 w-5 text-orange-400" /> Symbl API Credentials Required</>
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {credentialsSet 
                  ? "Your Symbl API credentials have been configured. You can upload meeting recordings for transcription and insights."
                  : "To use the meeting transcription features, you need to set your Symbl API credentials."}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant={credentialsSet ? "outline" : "default"}
                size="sm"
                onClick={() => setCredentialsDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <KeyRound className="h-4 w-4" />
                {credentialsSet ? "Update Credentials" : "Set Credentials"}
              </Button>
            </CardFooter>
          </Card>
        )}

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
      </main>

      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Symbl API Credentials</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your Symbl API credentials to enable meeting transcription and insights.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="symblAppId" className="text-right text-sm">
                App ID
              </label>
              <Input
                id="symblAppId"
                className="col-span-3 bg-slate-700 border-slate-600"
                value={symblAppId}
                onChange={(e) => setSymblAppId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="symblAppSecret" className="text-right text-sm">
                App Secret
              </label>
              <Input
                id="symblAppSecret"
                type="password"
                className="col-span-3 bg-slate-700 border-slate-600"
                value={symblAppSecret}
                onChange={(e) => setSymblAppSecret(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCredentialsSave}>Save Credentials</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meetings;
