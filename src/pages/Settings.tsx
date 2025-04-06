
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ApiKeysStatus = {
  openai: boolean;
  elevenlabs: boolean;
  ghl: boolean;
  stripe: boolean;
};

type BrandingSettings = {
  name: string;
  color: string;
  logoUrl: string;
};

const Settings = () => {
  // Brand settings
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  
  // API key settings
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [ghlKey, setGhlKey] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  
  // Loading states
  const [loadingBrand, setLoadingBrand] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  
  // Load existing settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Use any() to bypass TypeScript's type checking for now
        // since our types don't yet know about the settings table
        const { data: brandData, error: brandError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'branding')
          .single();
          
        if (brandData && !brandError) {
          try {
            const parsedData = JSON.parse(brandData.value) as BrandingSettings;
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
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const saveBrandSettings = async () => {
    setLoadingBrand(true);
    try {
      // Use any() to bypass TypeScript's type checking for now
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
        stripe: stripeKey !== "••••••••••••••••••••••" ? stripeKey : null
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
      
      toast.success("API keys updated successfully!");
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys. Please try again.");
    } finally {
      setLoadingKeys(false);
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Tabs defaultValue="branding">
        <TabsList className="mb-6">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Client Branding Settings</CardTitle>
              <CardDescription>Customize the appearance of your client portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
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
                    <span className="text-sm text-muted-foreground">{color}</span>
                  </div>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">API Keys</CardTitle>
              <CardDescription>Manage integration API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="openaiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiKey"
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-muted-foreground">Used for Jarvis chat responses</p>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="elevenlabsKey">ElevenLabs API Key</Label>
                  <Input
                    id="elevenlabsKey"
                    type="password"
                    value={elevenlabsKey}
                    onChange={(e) => setElevenlabsKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for voice generation</p>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="ghlKey">Go High Level API Key</Label>
                  <Input
                    id="ghlKey"
                    type="password"
                    value={ghlKey}
                    onChange={(e) => setGhlKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for CRM integration</p>
                </div>
                
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="stripeKey">Stripe Secret Key</Label>
                  <Input
                    id="stripeKey"
                    type="password"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for payment processing (optional)</p>
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
  );
};

export default Settings;
