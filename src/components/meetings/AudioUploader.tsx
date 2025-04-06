
import React, { useState, useRef } from 'react';
import { Upload, RefreshCcw, Link, FileAudio, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadMeetingAudio } from "@/utils/symblClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadErrorHandler from './UploadErrorHandler';

interface AudioUploaderProps {
  credentialsSet: boolean | null;
  onUploadSuccess: () => void;
}

const AudioUploader = ({ credentialsSet, onUploadSuccess }: AudioUploaderProps) => {
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUrlUpload = async () => {
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

    // Clear previous errors
    setUploadError(null);
    setIsUploading(true);
    
    try {
      await uploadMeetingAudio({ url: audioUrl });
      toast({
        title: "Success",
        description: "Meeting audio URL uploaded successfully. Processing will begin shortly.",
      });
      setAudioUrl("");
      onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Upload Failed",
        description: "Check the error details below for more information",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an audio file to upload",
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

    // Clear previous errors
    setUploadError(null);
    setIsUploading(true);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        try {
          const base64data = reader.result?.toString().split(',')[1];
          if (!base64data) throw new Error("Failed to read file");
          
          await uploadMeetingAudio({ fileContent: base64data, fileName: selectedFile.name });
          
          toast({
            title: "Success",
            description: "Meeting audio file uploaded successfully. Processing will begin shortly.",
          });
          
          // Reset file selection
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          
          onUploadSuccess();
        } catch (error) {
          console.error("File processing error:", error);
          setUploadError(error instanceof Error ? error.message : "Unknown error occurred");
          toast({
            title: "Upload Failed",
            description: "Check the error details below for more information",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        setUploadError("Failed to read the selected file");
        toast({
          title: "Error",
          description: "Failed to read the selected file",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred");
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Check the error details below for more information",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white mb-6">
      <CardHeader>
        <CardTitle>Upload Meeting Recording</CardTitle>
      </CardHeader>
      <CardContent>
        <UploadErrorHandler error={uploadError} onDismiss={() => setUploadError(null)} />
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Use URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="audio/*,video/*"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="whitespace-nowrap">
                  {selectedFile && (
                    <span className="text-xs text-gray-300 mr-2">
                      {selectedFile.name.length > 20 
                        ? selectedFile.name.substring(0, 20) + '...' 
                        : selectedFile.name}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleFileUpload} 
                disabled={isUploading || !selectedFile || !credentialsSet}
                className="w-full flex items-center justify-center gap-2"
              >
                {isUploading ? 
                  <RefreshCcw className="h-4 w-4 animate-spin" /> : 
                  <Upload className="h-4 w-4" />
                }
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter URL to meeting audio/video recording"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                onClick={handleUrlUpload} 
                disabled={isUploading || !audioUrl || !credentialsSet}
                className="w-full flex items-center justify-center gap-2"
              >
                {isUploading ? 
                  <RefreshCcw className="h-4 w-4 animate-spin" /> : 
                  <Upload className="h-4 w-4" />
                }
                {isUploading ? "Uploading..." : "Upload URL"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-gray-400">
        <span>Supported formats: MP4, MP3, WAV, and most audio/video formats</span>
        <span className="mt-1 text-amber-400/70 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> For web services like YouTube, download the file first
        </span>
      </CardFooter>
    </Card>
  );
};

export default AudioUploader;
