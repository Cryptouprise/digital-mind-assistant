
import React, { useState } from 'react';
import { KeyRound, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { checkSymblCredentials } from "@/utils/checkSymblCredentials";
import { supabase } from "@/integrations/supabase/client";

interface SymblCredentialsManagerProps {
  credentialsSet: boolean | null;
  onCredentialsUpdate: (isSet: boolean) => void;
}

const SymblCredentialsManager = ({ credentialsSet, onCredentialsUpdate }: SymblCredentialsManagerProps) => {
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [symblAppId, setSymblAppId] = useState("");
  const [symblAppSecret, setSymblAppSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleCredentialsSave = async () => {
    try {
      setIsSaving(true);
      
      if (!symblAppId || !symblAppSecret) {
        toast({
          title: "Error",
          description: "Both App ID and App Secret are required",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Update the credentials in Supabase via our edge function
      const { data, error } = await supabase.functions.invoke('update-secret-keys', {
        body: {
          keys: {
            symbl_app_id: symblAppId,
            symbl_app_secret: symblAppSecret,
          }
        }
      });

      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(error.message);
      }
      
      console.log("Credentials saved response:", data);
      
      // Wait a bit longer to ensure credentials are properly stored
      // and synced across all services
      toast({
        title: "Saving credentials",
        description: "Verifying credentials..."
      });
      
      // Important: Wait a moment (allows credentials to be stored and verified)
      setTimeout(async () => {
        try {
          // Verify the credentials were actually set correctly
          const areSet = await checkSymblCredentials();
          
          toast({
            title: areSet ? "Success" : "Warning",
            description: areSet 
              ? "Symbl credentials saved and verified successfully" 
              : "Credentials were saved but verification failed. Please check your credentials and try again.",
            variant: areSet ? "default" : "destructive",
          });
          
          onCredentialsUpdate(areSet);
          
          if (areSet) {
            setCredentialsDialogOpen(false);
            setSymblAppId("");
            setSymblAppSecret("");
          }
        } catch (verifyError) {
          console.error("Error verifying credentials:", verifyError);
          toast({
            title: "Verification Error",
            description: "Could not verify if credentials were set properly. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save credentials",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  if (credentialsSet === null) return null;

  return (
    <>
      <Card className={`mb-4 border ${credentialsSet ? 'border-green-500 bg-green-900/20' : 'border-orange-500 bg-orange-900/20'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {credentialsSet ? 
              <><CheckCircle className="h-5 w-5 text-green-400" /> Symbl API Credentials Set</> : 
              <><AlertCircle className="h-5 w-5 text-orange-400" /> Symbl API Credentials Required</>
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {credentialsSet 
              ? "Your Symbl API credentials have been configured. You can upload meeting recordings for transcription and insights."
              : "To use the meeting transcription features, you need to set your Symbl API credentials."}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant={credentialsSet ? "outline" : "default"}
            size="sm"
            onClick={() => setCredentialsDialogOpen(true)}
            className="flex items-center gap-1"
            data-credentials-button="true"
          >
            <KeyRound className="h-4 w-4" />
            {credentialsSet ? "Update Credentials" : "Set Credentials"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>Symbl API Credentials</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your Symbl API credentials to enable meeting transcription and insights.
              <a 
                href="https://platform.symbl.ai/#/login" 
                target="_blank" 
                rel="noreferrer" 
                className="block mt-2 text-blue-400 hover:underline"
              >
                Get your credentials from the Symbl Platform
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="symblAppId" className="text-right text-sm">
                App ID
              </label>
              <Input
                id="symblAppId"
                className="col-span-3 bg-slate-700 border-slate-600"
                value={symblAppId}
                onChange={(e) => setSymblAppId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="symblAppSecret" className="text-right text-sm">
                App Secret
              </label>
              <Input
                id="symblAppSecret"
                type="password"
                className="col-span-3 bg-slate-700 border-slate-600"
                value={symblAppSecret}
                onChange={(e) => setSymblAppSecret(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredentialsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCredentialsSave} disabled={isSaving || !symblAppId || !symblAppSecret}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Credentials"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SymblCredentialsManager;
