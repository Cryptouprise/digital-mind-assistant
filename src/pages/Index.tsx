
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelRightOpen, MessageSquareText, Settings2, CalendarCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Roadmap } from "@/components/Roadmap";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <ScrollArea className="h-screen w-full">
        <div className="container py-4 md:py-8 max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-start mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Jarvis Dashboard</h1>
            <p className="text-gray-400 mt-1">Your digital mind assistant</p>
          </div>

          <div className="mb-8">
            <Roadmap />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/chat" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-blue-400" />
                    <span>AI Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Chat with your AI assistant to get answers and take actions</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/meetings" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-blue-400" />
                    <span>Meetings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Upload, transcribe, and analyze meeting recordings</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/settings" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-400" />
                    <span>Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Configure your account and API settings</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/documentation" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <PanelRightOpen className="h-5 w-5 text-blue-400" />
                    <span>Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Learn how to use Jarvis and integrate with your systems</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Index;
