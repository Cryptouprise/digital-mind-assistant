
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
  
  // Load existing settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use type casting to bypass TypeScript's type checking
        // since the types don't yet know about the settings table
        const { data: brandData, error: brandError } = await supabase
          .from('settings' as any)
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
        }
        
        // Load API keys (masked)
        const { data: apiKeys, error: apiKeysError } = await supabase.functions.invoke('get-secret-keys');
        
        if (apiKeys && !apiKeysError) {
          const keyStatus = apiKeys as ApiKeysStatus;
          setOpenaiKey(keyStatus.openai ? "••••••••••••••••••••••" : "");
          setElevenlabsKey(keyStatus.elevenlabs ? "••••••••••••••••••••••" : "");
          setGhlKey(keyStatus.ghl ? "••••••••••••••••••••••" : "");
          setStripeKey(keyStatus.stripe ? "••••••••••••••••••••••" : "");
        }

        // Load Symbl credentials
        const { data: symblAppIdData } = await supabase
          .from('settings' as any)
          .select('value')
          .eq('key', 'symbl_app_id')
          .single();
          
        if (symblAppIdData) {
          setSymblAppId("••••••••••••••••••••••");
        }
        
        const { data: symblAppSecretData } = await supabase
          .from('settings' as any)
          .select('value')
          .eq('key', 'symbl_app_secret')
          .single();
          
        if (symblAppSecretData) {
          setSymblAppSecret("••••••••••••••••••••••");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const saveBrandSettings = async () => {
    setLoadingBrand(true);
    try {
      // Use type casting to bypass TypeScript's type checking
      const { error } = await supabase
        .from('settings' as any)
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
      
      const { error } = await supabase.functions.invoke('update-secret-keys', {
        body: { keys }
      });
      
      if (error) throw error;
      
      // Mask the keys after successful save
      if (openaiKey && openaiKey !== "••••••••••••••••••••••") setOpenaiKey("••••••••••••••••••••••");
      if (elevenlabsKey && elevenlabsKey !== "••••••••••••••••••••••") setElevenlabsKey("••••••••••••••••••••••");
      if (ghlKey && ghlKey !== "••••••••••••••••••••••") setGhlKey("••••••••••••••••••••••");
      if (stripeKey && stripeKey !== "••••••••••••••••••••••") setStripeKey("••••••••••••••••••••••");
      if (symblAppId && symblAppId !== "••••••••••••••••••••••") setSymblAppId("••••••••••••••••••••••");
      if (symblAppSecret && symblAppSecret !== "••••••••••••••••••••••") setSymblAppSecret("••••••••••••••••••••••");
      
      toast.success("API keys updated successfully!");
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys. Please try again.");
    } finally {
      setLoadingKeys(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ScrollArea className="h-screen w-full">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">Settings</h1>
          
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;
