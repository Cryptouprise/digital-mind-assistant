
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type ApiKeysStatus = {
  openai: boolean;
  elevenlabs: boolean;
  ghl: boolean;
  stripe: boolean;
  symbl: boolean;
};

type BrandingSettings = {
  name: string;
  color: string;
  logoUrl: string;
};

// Define a type for settings table rows
type SettingsRow = {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

const Settings = () => {
  const isMobile = useIsMobile();
  
  // Brand settings
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  
  // API key settings
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [ghlKey, setGhlKey] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [symblAppId, setSymblAppId] = useState("");
  const [symblAppSecret, setSymblAppSecret] = useState("");
  
  // Loading states
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [keyStatus, setKeyStatus] = useState<ApiKeysStatus | null>(null);
  const [error, setError] = useState("");
  
  // Load existing settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoadingSettings(true);
      setError("");
      
      try {
        console.log("Loading settings...");
        // Use type casting to bypass TypeScript's type checking
        // since the types don't yet know about the settings table
        const { data: brandData, error: brandError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'branding')
          .single();
          
        if (brandData && !brandError) {
          try {
            const typedData = brandData as unknown as SettingsRow;
            const parsedData = JSON.parse(typedData.value) as BrandingSettings;
            setBrandName(parsedData.name || "");
            setColor(parsedData.color || "#000000");
            setLogoUrl(parsedData.logoUrl || "");
          } catch (e) {
            console.error("Error parsing branding data:", e);
          }
        } else if (brandError) {
          console.error("Error loading branding settings:", brandError);
        }
        
        // Load API keys status
        const { data: apiKeysData, error: apiKeysError } = await supabase.functions.invoke('get-secret-keys');
        
        if (apiKeysData && !apiKeysError) {
          setKeyStatus(apiKeysData as ApiKeysStatus);
          console.log("API Keys status:", apiKeysData);
          
          // Set masked placeholder values for keys that exist
          if (apiKeysData.openai) setOpenaiKey("••••••••••••••••••••••");
          if (apiKeysData.elevenlabs) setElevenlabsKey("••••••••••••••••••••••");
          if (apiKeysData.ghl) setGhlKey("••••••••••••••••••••••");
          if (apiKeysData.stripe) setStripeKey("••••••••••••••••••••••");
          if (apiKeysData.symbl) {
            setSymblAppId("••••••••••••••••••••••");
            setSymblAppSecret("••••••••••••••••••••••");
          }
        } else if (apiKeysError) {
          console.error("Error loading API keys status:", apiKeysError);
          setError("Failed to load API keys. Please check your connection and try again.");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoadingSettings(false);
      }
    };
    
    loadSettings();
  }, []);

  const saveBrandSettings = async () => {
    setLoadingBrand(true);
    try {
      // Use type casting to bypass TypeScript's type checking
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'branding',
          value: JSON.stringify({
            name: brandName,
            color,
            logoUrl
          })
        }, { onConflict: 'key' });
      
      if (error) throw error;
      toast.success("Brand settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoadingBrand(false);
    }
  };

  const saveApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const keys = {
        openai: openaiKey !== "••••••••••••••••••••••" ? openaiKey : null,
        elevenlabs: elevenlabsKey !== "••••••••••••••••••••••" ? elevenlabsKey : null,
        ghl: ghlKey !== "••••••••••••••••••••••" ? ghlKey : null,
        stripe: stripeKey !== "••••••••••••••••••••••" ? stripeKey : null,
        symbl_app_id: symblAppId !== "••••••••••••••••••••••" ? symblAppId : null,
        symbl_app_secret: symblAppSecret !== "••••••••••••••••••••••" ? symblAppSecret : null
      };
      
      console.log("Saving API keys:", keys);
      
      const { data, error } = await supabase.functions.invoke('update-secret-keys', {
        body: { keys }
      });
      
      if (error) throw error;
      
      console.log("API keys saved response:", data);
      
      // Mask the keys after successful save
      if (openaiKey && openaiKey !== "••••••••••••••••••••••") setOpenaiKey("••••••••••••••••••••••");
      if (elevenlabsKey && elevenlabsKey !== "••••••••••••••••••••••") setElevenlabsKey("••••••••••••••••••••••");
      if (ghlKey && ghlKey !== "••••••••••••••••••••••") setGhlKey("••••••••••••••••••••••");
      if (stripeKey && stripeKey !== "••••••••••••••••••••••") setStripeKey("••••••••••••••••••••••");
      if (symblAppId && symblAppId !== "••••••••••••••••••••••") setSymblAppId("••••••••••••••••••••••");
      if (symblAppSecret && symblAppSecret !== "••••••••••••••••••••••") setSymblAppSecret("••••••••••••••••••••••");
      
      // Refresh key status
      await refreshKeyStatus();
      
      toast.success("API keys updated successfully!");
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys. Please try again.");
    } finally {
      setLoadingKeys(false);
    }
  };
  
  const refreshKeyStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-secret-keys');
      
      if (data && !error) {
        setKeyStatus(data as ApiKeysStatus);
      }
    } catch (error) {
      console.error("Error refreshing key status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ScrollArea className="h-screen w-full">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">Settings</h1>
          
          {error && (
            <div className="mb-6 p-4 border border-red-500 bg-red-900/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p>{error}</p>
            </div>
          )}
          
          {isLoadingSettings ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2 text-blue-500" />
              <span className="text-xl">Loading settings...</span>
            </div>
          ) : (
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="mb-4 md:mb-6 w-full flex overflow-x-auto no-scrollbar">
                <TabsTrigger className="flex-1 text-sm md:text-base" value="branding">Branding</TabsTrigger>
                <TabsTrigger className="flex-1 text-sm md:text-base" value="api-keys">API Keys</TabsTrigger>
              </TabsList>
              
              <TabsContent value="branding">
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Client Branding Settings</CardTitle>
                    <CardDescription className="text-gray-400">Customize the appearance of your client portal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 md:space-y-6">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="color">Primary Color</Label>
                        <div className="flex items-center gap-3">
                          <input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-16 h-10 border rounded cursor-pointer"
                          />
                          <span className="text-sm text-gray-400">{color}</span>
                        </div>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      
                      <Button 
                        onClick={saveBrandSettings} 
                        className="w-full sm:w-auto"
                        disabled={loadingBrand}
                      >
                        {loadingBrand ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api-keys">
                <Card className="bg-slate-800 border-slate-700 text-white mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">API Keys Status</CardTitle>
                    <CardDescription className="text-gray-400">Current status of your API integrations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg border ${keyStatus?.openai ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {keyStatus?.openai ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                          }
                          <span className="font-medium">OpenAI API</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">{keyStatus?.openai ? "Configured" : "Not configured"}</p>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${keyStatus?.elevenlabs ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {keyStatus?.elevenlabs ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                          }
                          <span className="font-medium">ElevenLabs API</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">{keyStatus?.elevenlabs ? "Configured" : "Not configured"}</p>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${keyStatus?.ghl ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {keyStatus?.ghl ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                          }
                          <span className="font-medium">GoHighLevel API</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">{keyStatus?.ghl ? "Configured" : "Not configured"}</p>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${keyStatus?.stripe ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {keyStatus?.stripe ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                          }
                          <span className="font-medium">Stripe API</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">{keyStatus?.stripe ? "Configured" : "Not configured"}</p>
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${keyStatus?.symbl ? 'border-green-500 bg-green-900/20' : 'border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center gap-2">
                          {keyStatus?.symbl ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> : 
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                          }
                          <span className="font-medium">Symbl AI</span>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">{keyStatus?.symbl ? "Configured" : "Not configured"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">API Keys</CardTitle>
                    <CardDescription className="text-gray-400">Manage integration API keys</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 md:space-y-6">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="openaiKey">OpenAI API Key</Label>
                        <Input
                          id="openaiKey"
                          type="password"
                          value={openaiKey}
                          onChange={(e) => setOpenaiKey(e.target.value)}
                          placeholder="sk-..."
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for Jarvis chat responses</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="elevenlabsKey">ElevenLabs API Key</Label>
                        <Input
                          id="elevenlabsKey"
                          type="password"
                          value={elevenlabsKey}
                          onChange={(e) => setElevenlabsKey(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for voice generation</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="ghlKey">Go High Level API Key</Label>
                        <Input
                          id="ghlKey"
                          type="password"
                          value={ghlKey}
                          onChange={(e) => setGhlKey(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for CRM integration</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeKey"
                          type="password"
                          value={stripeKey}
                          onChange={(e) => setStripeKey(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for payment processing (optional)</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="symblAppId">Symbl App ID</Label>
                        <Input
                          id="symblAppId"
                          type="password"
                          value={symblAppId}
                          onChange={(e) => setSymblAppId(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for meeting transcription and analysis</p>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="symblAppSecret">Symbl App Secret</Label>
                        <Input
                          id="symblAppSecret"
                          type="password"
                          value={symblAppSecret}
                          onChange={(e) => setSymblAppSecret(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                        <p className="text-xs text-gray-400">Used for meeting transcription and analysis</p>
                      </div>
                      
                      <Button 
                        onClick={saveApiKeys} 
                        className="w-full sm:w-auto"
                        disabled={loadingKeys}
                      >
                        {loadingKeys ? "Saving..." : "Save API Keys"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;
