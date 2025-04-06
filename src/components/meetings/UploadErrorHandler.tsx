
import React from 'react';
import { AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface UploadErrorProps {
  error: string | null;
  onDismiss: () => void;
}

const UploadErrorHandler: React.FC<UploadErrorProps> = ({ error, onDismiss }) => {
  const navigate = useNavigate();
  
  if (!error) return null;
  
  // Check if error is related to Symbl credentials
  const isCredentialError = error.includes("credentials") || 
                          error.includes("Symbl API") || 
                          error.includes("non-2xx") ||
                          error.includes("authorization");
  
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
            {isCredentialError && (
              <li className="text-amber-300 font-medium">Check that your Symbl credentials are correct</li>
            )}
          </ul>
          
          {isCredentialError && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs"
                onClick={() => navigate('/settings')}
              >
                <ExternalLink className="h-3 w-3" />
                Go to Settings to update credentials
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UploadErrorHandler;
