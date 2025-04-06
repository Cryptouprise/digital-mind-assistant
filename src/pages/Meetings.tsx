
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Upload } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetings, uploadMeetingAudio } from "@/utils/symblClient";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import our components
import SymblCredentialsManager from "@/components/meetings/SymblCredentialsManager";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingSummaries from "@/components/meetings/MeetingSummaries";

const Meetings = () => {
  const [credentialsSet, setCredentialsSet] = useState<boolean | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
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
    retry: 3, // Retry 3 times if the request fails
  });

  const checkCredentials = useCallback(async () => {
    try {
      const areSet = await checkSymblCredentials();
      console.log("Credentials check result:", areSet);
      setCredentialsSet(areSet);
      
      if (!areSet) {
        toast({
          title: "Symbl Credentials Required",
          description: "Please set your Symbl credentials to upload meeting recordings.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error checking credentials:", err);
      toast({
        title: "Credential Check Failed",
        description: "Could not verify Symbl credentials status.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Check if Symbl credentials are set
    checkCredentials();
  }, [checkCredentials]);

  const handleCredentialsUpdate = async (isSet: boolean) => {
    setCredentialsSet(isSet);
    if (isSet) {
      toast({
        title: "Credentials Updated",
        description: "Your Symbl credentials have been set successfully.",
      });
    }
    // Refetch meetings after credentials update
    await refetch();
  };

  const handleUpload = async () => {
    if (!audioUrl.trim()) return;
    
    setUploading(true);
    try {
      await uploadMeetingAudio(audioUrl);
      toast({
        title: "Upload Successful",
        description: "Meeting audio uploaded. Processing will begin shortly.",
      });
      refetch();
      setAudioUrl("");
    } catch (err) {
      console.error('Error uploading meeting audio:', err);
      toast({
        title: "Upload Failed",
        description: err instanceof Error ? err.message : "Could not upload audio file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

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

        <SymblCredentialsManager 
          credentialsSet={credentialsSet}
          onCredentialsUpdate={handleCredentialsUpdate}
        />

        {/* Simple Upload Form */}
        <div className="mb-6 bg-slate-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Upload size={18} />
            Upload Recording for Analysis
          </h2>
          <div className="flex gap-3">
            <Input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="Paste audio file URL..."
              className="bg-slate-700 border-slate-600"
              disabled={!credentialsSet || uploading}
            />
            <Button
              onClick={handleUpload}
              disabled={!credentialsSet || uploading || !audioUrl.trim()}
              className="whitespace-nowrap"
            >
              {uploading ? "Uploading..." : "Submit to Jarvis"}
            </Button>
          </div>
          {!credentialsSet && (
            <p className="mt-2 text-sm text-amber-400">Set Symbl credentials to upload recordings</p>
          )}
        </div>

        <MeetingsList 
          meetings={meetings}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          onRefresh={() => refetch()}
        />

        {meetings.length > 0 && <MeetingSummaries meetings={meetings} />}
      </main>
    </div>
  );
};

export default Meetings;
