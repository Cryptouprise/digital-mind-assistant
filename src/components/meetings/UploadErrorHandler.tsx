
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UploadErrorProps {
  error: string | null;
  onDismiss: () => void;
}

const UploadErrorHandler: React.FC<UploadErrorProps> = ({ error, onDismiss }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-5">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        Upload Failed
        <button 
          onClick={onDismiss} 
          className="text-xs opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="text-sm">{error}</div>
        <div className="mt-2 text-xs">
          <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" /> Tips:</p>
          <ul className="list-disc list-inside ml-1 mt-1">
            <li>Ensure the URL is directly to an audio or video file</li>
            <li>For YouTube or other streaming sites, download the file first</li>
            <li>Try uploading a local file instead</li>
            <li>Check that your Symbl credentials are correct</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadErrorHandler;
