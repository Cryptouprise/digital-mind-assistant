
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Clock, Calendar, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ghlClient } from "@/utils/ghlClient";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  date: string;
  summary?: string;
  contact_id?: string | null;
  follow_up_sent?: boolean;
}

interface RecentMeetingSummaryProps {
  meeting: Meeting | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const RecentMeetingSummary: React.FC<RecentMeetingSummaryProps> = ({ meeting, isLoading, onRefresh }) => {
  const handleSendFollowUp = async () => {
    if (!meeting || !meeting.contact_id || !meeting.summary) {
      toast.error("Unable to send follow-up. Missing contact ID or summary.");
      return;
    }

    try {
      toast.info("Sending follow-up message...");
      await ghlClient.sendFollowUp(meeting.contact_id, 
        `Here's a summary of our meeting: ${meeting.summary.substring(0, 200)}...`);
      
      toast.success("Follow-up sent successfully!");
      onRefresh();
    } catch (error) {
      console.error("Error sending follow-up:", error);
      toast.error("Failed to send follow-up message");
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Loading Latest Meeting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!meeting) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Latest Meeting Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-400">No recent meeting recordings found</p>
            <Button 
              className="mt-4 bg-blue-600 hover:bg-blue-700" 
              size="sm" 
              onClick={() => onRefresh()}
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          Latest Meeting Summary
        </CardTitle>
        <CardDescription className="text-gray-400">
          {new Date(meeting.date).toLocaleDateString()} - {meeting.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="bg-slate-700/50 p-4 rounded-md mb-4">
          <p className="text-sm whitespace-pre-line text-slate-300">
            {meeting.summary || "No summary available for this meeting."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {meeting.contact_id && !meeting.follow_up_sent ? (
            <Button 
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
              onClick={handleSendFollowUp}
            >
              <MessageSquare className="h-4 w-4" />
              Send Follow-up
            </Button>
          ) : meeting.follow_up_sent ? (
            <div className="flex items-center text-green-400 text-xs">
              <MessageSquare className="h-4 w-4 mr-1" />
              Follow-up sent
            </div>
          ) : null}
          
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-600 hover:bg-slate-700"
            onClick={() => onRefresh()}
          >
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMeetingSummary;
