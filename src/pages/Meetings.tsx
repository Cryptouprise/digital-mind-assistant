
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetings } from "@/utils/symblClient";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import our components
import SymblCredentialsManager from "@/components/meetings/SymblCredentialsManager";
import MeetingsList from "@/components/meetings/MeetingsList";
import MeetingSummaries from "@/components/meetings/MeetingSummaries";
import AudioUploader from "@/components/meetings/AudioUploader";
import SymblRealtime from "@/components/meetings/SymblRealtime";
import JoinMeetingModal from "@/components/meetings/JoinMeetingModal";
import ZoomMeeting from "@/components/meetings/ZoomMeeting";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Video, Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileNavigation from "@/components/MobileNavigation";

interface LocationState {
  activeZoomMeeting?: {
    url: string;
    displayName: string;
    symblToken: string;
  };
}

const Meetings = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | undefined;
  const [credentialsSet, setCredentialsSet] = useState<boolean | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeZoomMeeting, setActiveZoomMeeting] = useState<{
    url: string;
    displayName: string;
    symblToken: string;
  } | null>(locationState?.activeZoomMeeting || null);
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

  // Clear location state after using it
  useEffect(() => {
    if (locationState?.activeZoomMeeting) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleJoinMeeting = (meetingUrl: string, displayName: string, symblToken: string) => {
    setActiveZoomMeeting({ url: meetingUrl, displayName, symblToken });
    setShowJoinModal(false);
  };

  const handleEndMeeting = () => {
    setActiveZoomMeeting(null);
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-6">
      {/* Fixed navigation header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-800 border-b border-slate-700 py-3 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold">Meeting Insights</h1>
          </div>
          
          <div className="flex gap-2 items-center">
            {!activeZoomMeeting && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 border-blue-500"
              >
                <LinkIcon className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Join Meeting</span>
              </Button>
            )}
            
            {isMobile ? (
              <MobileNavigation />
            ) : (
              <Link to="/" className="flex items-center text-blue-400 hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16 px-4 max-w-5xl mx-auto">
        <div className="space-y-4 md:space-y-6 mt-4">
          {activeZoomMeeting ? (
            <ErrorBoundary>
              <ZoomMeeting 
                meetingUrl={activeZoomMeeting.url}
                displayName={activeZoomMeeting.displayName}
                symblToken={activeZoomMeeting.symblToken}
                onEndMeeting={handleEndMeeting}
              />
            </ErrorBoundary>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                  <ErrorBoundary>
                    <SymblRealtime />
                  </ErrorBoundary>
                </div>
                
                <div className="lg:col-span-1 space-y-4">
                  <ErrorBoundary>
                    <SymblCredentialsManager 
                      credentialsSet={credentialsSet}
                      onCredentialsUpdate={handleCredentialsUpdate}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <AudioUploader 
                      credentialsSet={credentialsSet}
                      onUploadSuccess={handleRefresh}
                    />
                  </ErrorBoundary>
                </div>
              </div>

              <ErrorBoundary>
                <MeetingsList 
                  meetings={meetings}
                  isLoading={isLoading}
                  error={error instanceof Error ? error : null}
                  onRefresh={handleRefresh}
                />
              </ErrorBoundary>

              {meetings.length > 0 && (
                <ErrorBoundary>
                  <MeetingSummaries meetings={meetings} />
                </ErrorBoundary>
              )}
            </>
          )}
        </div>
      </main>
      
      <JoinMeetingModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinMeeting}
      />
    </div>
  );
};

export default Meetings;
