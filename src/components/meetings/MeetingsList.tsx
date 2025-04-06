
import React, { useState } from 'react';
import { RefreshCcw, AlertCircle, CheckCircle, Loader2, Tag, Link, Send, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Meeting, sendFollowUp, addTag } from "@/utils/symblClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const MeetingsList = ({ meetings, isLoading, error, onRefresh }: MeetingsListProps) => {
  const { toast } = useToast();
  const [processingMeeting, setProcessingMeeting] = useState<string | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const handleSendFollowUp = async (meetingId: string, contactId: string | null) => {
    if (!contactId) {
      toast({
        title: "Cannot send follow-up",
        description: "No contact is associated with this meeting",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingMeeting(meetingId);
    
    try {
      const success = await sendFollowUp(meetingId, contactId);
      
      if (success) {
        toast({
          title: "Follow-up sent",
          description: "Follow-up message has been sent successfully",
        });
        onRefresh();
      } else {
        toast({
          title: "Failed to send follow-up",
          description: "There was an error sending the follow-up message",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingMeeting(null);
    }
  };

  const openTagDialog = (meetingId: string) => {
    setCurrentMeetingId(meetingId);
    setNewTag('');
    setTagDialogOpen(true);
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !currentMeetingId) return;
    
    try {
      await addTag(currentMeetingId, newTag.trim());
      toast({
        title: "Tag added",
        description: `Tag "${newTag}" has been added to the meeting`,
      });
      onRefresh();
      setTagDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error adding tag",
        description: "Failed to add the tag",
        variant: "destructive",
      });
    }
  };

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
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {meeting.tags && meeting.tags.length > 0 ? meeting.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="bg-slate-700 text-xs border-slate-600">
                            {tag}
                          </Badge>
                        )) : (
                          <span className="text-xs text-gray-400">No tags</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-5 w-5 p-0 ml-1" 
                          onClick={() => openTagDialog(meeting.id)}
                        >
                          <Tag className="h-3 w-3 text-blue-400" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {meeting.contact_id && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Link className="h-4 w-4 text-blue-400" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View in CRM</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={meeting.follow_up_sent ? "ghost" : "secondary"}
                                size="sm"
                                className={`h-8 ${meeting.follow_up_sent ? 'opacity-50' : ''}`}
                                onClick={() => !meeting.follow_up_sent && handleSendFollowUp(meeting.id, meeting.contact_id)}
                                disabled={processingMeeting === meeting.id || meeting.follow_up_sent || !meeting.contact_id}
                              >
                                {processingMeeting === meeting.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : meeting.follow_up_sent ? (
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                ) : (
                                  <Send className="h-4 w-4 mr-1" />
                                )}
                                {meeting.follow_up_sent ? 'Sent' : 'Follow-Up'}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{meeting.follow_up_sent ? 'Follow-up already sent' : 'Send follow-up message'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag} disabled={!newTag.trim()}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MeetingsList;
