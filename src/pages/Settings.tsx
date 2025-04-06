
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Settings = () => {
  const [brandName, setBrandName] = useState("");
  const [color, setColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");

  const saveSettings = () => {
    // Placeholder — Hook into Supabase or backend later
    console.log("Saved:", { brandName, color, logoUrl });
    toast.success("Brand settings saved successfully!");
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Client Branding Settings</CardTitle>
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
            
            <Button onClick={saveSettings} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
