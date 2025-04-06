
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetings } from "@/utils/symblClient";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our components
import SymblCredentialsManager from "@/components/meetings/SymblCredentialsManager";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingSummaries from "@/components/meetings/MeetingSummaries";
import AudioUploader from "@/components/meetings/AudioUploader";

const Meetings = () => {
  const [credentialsSet, setCredentialsSet] = useState<boolean | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      
      <main className="p-4 md:p-6 max-w-5xl mx-auto h-full overflow-y-auto">
        <div className={`mb-4 md:mb-6 ${isMobile ? 'flex flex-col gap-2' : 'flex justify-between items-center'}`}>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold">Meeting Insights</h1>
          </div>
          <Link to="/" className="flex items-center text-blue-400 hover:underline text-sm md:text-base">
            <ArrowLeft className="mr-1 h-3 w-3 md:h-4 md:w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-4 md:space-y-6">
          <SymblCredentialsManager 
            credentialsSet={credentialsSet}
            onCredentialsUpdate={handleCredentialsUpdate}
          />

          <AudioUploader 
            credentialsSet={credentialsSet}
            onUploadSuccess={() => refetch()}
          />

          <MeetingsList 
            meetings={meetings}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            onRefresh={() => refetch()}
          />

          {meetings.length > 0 && <MeetingSummaries meetings={meetings} />}
        </div>
      </main>
    </div>
  );
};

export default Meetings;
