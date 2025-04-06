
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Video, User, Link, Loader2 } from "lucide-react";
import { initSymblRealtime } from "@/utils/symblClient";

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (meetingUrl: string, displayName: string, symblToken: string) => void;
}

const JoinMeetingModal: React.FC<JoinMeetingModalProps> = ({ isOpen, onClose, onJoinSuccess }) => {
  const [meetingUrl, setMeetingUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinMeeting = async () => {
    if (!meetingUrl) {
      toast({
        title: "Missing meeting URL",
        description: "Please enter a valid Zoom meeting URL",
        variant: "destructive"
      });
      return;
    }

    if (!displayName) {
      toast({
        title: "Missing display name",
        description: "Please enter your name to join the meeting",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get Symbl token - uses the actual Symbl.ai API now
      const { token } = await initSymblRealtime();
      
      if (!token) {
        throw new Error("Failed to initialize Symbl token");
      }

      // Call onJoinSuccess callback with meeting details
      onJoinSuccess(meetingUrl, displayName, token);
      
      toast({
        title: "Joining meeting",
        description: "Connecting to Zoom meeting with Symbl.ai integration"
      });
      
      // Close modal after successful join
      onClose();
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Failed to join meeting",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-400" />
            Join Zoom Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="meeting-url">Zoom Meeting URL or ID</Label>
            <Input
              id="meeting-url"
              placeholder="https://zoom.us/j/123456789 or 123456789"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="bg-slate-900 border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Your Display Name</Label>
            <Input
              id="display-name"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleJoinMeeting} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Join Meeting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinMeetingModal;
