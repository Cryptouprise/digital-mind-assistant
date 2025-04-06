
import React, { useState } from 'react';
import { Upload, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadMeetingAudio } from "@/utils/symblClient";

interface AudioUploaderProps {
  credentialsSet: boolean | null;
  onUploadSuccess: () => void;
}

const AudioUploader = ({ credentialsSet, onUploadSuccess }: AudioUploaderProps) => {
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Credentials Required",
        description: "Please set your Symbl credentials before uploading",
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
      onUploadSuccess();
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

  return (
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
  );
};

export default AudioUploader;
