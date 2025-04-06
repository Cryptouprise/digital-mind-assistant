
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetings } from "@/utils/symblClient";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { useToast } from "@/hooks/use-toast";

// Import our components
import SymblCredentialsManager from "@/components/meetings/SymblCredentialsManager";
import AudioUploader from "@/components/meetings/AudioUploader";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingSummaries from "@/components/meetings/MeetingSummaries";

const Meetings = () => {
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
      try {
        const areSet = await checkSymblCredentials();
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
    };
    
    checkCredentials();
  }, [toast]);

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

  const handleUploadSuccess = () => {
    toast({
      title: "Upload Successful",
      description: "Meeting audio uploaded. Processing will begin shortly.",
    });
    refetch();
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

        <AudioUploader 
          credentialsSet={credentialsSet}
          onUploadSuccess={handleUploadSuccess}
        />

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
