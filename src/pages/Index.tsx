
import React from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PanelRightOpen, 
  MessageSquareText, 
  Settings2, 
  CalendarCheck, 
  LayoutDashboard, 
  Activity,
  ArrowUp,
  Clock
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Roadmap } from "@/components/Roadmap";

const Index = () => {
  const isMobile = useIsMobile();
  
  // Mock stats data (would come from API in real implementation)
  const stats = [
    { 
      title: "Meetings Analyzed", 
      value: "24", 
      change: "+12%", 
      trend: "up", 
      description: "Last 30 days"
    },
    { 
      title: "AI Interactions", 
      value: "143", 
      change: "+28%", 
      trend: "up", 
      description: "Last 30 days" 
    },
    { 
      title: "Automations Run", 
      value: "17", 
      change: "+5%", 
      trend: "up", 
      description: "Last 30 days" 
    }
  ];
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />
      <ScrollArea className="h-screen w-full">
        <div className="container py-4 md:py-8 max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-start mb-6">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-blue-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Jarvis Dashboard</h1>
            </div>
            <p className="text-gray-400 mt-1">Your digital mind assistant</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                    <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <Roadmap />
            </div>
            
            <Card className="bg-slate-800 border-slate-700 text-white h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-blue-500 pl-4 py-1">
                  <p className="font-medium">Meeting Analyzed</p>
                  <p className="text-sm text-gray-400">Client Strategy Session</p>
                  <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                </div>
                <div className="border-l-2 border-green-500 pl-4 py-1">
                  <p className="font-medium">GHL Integration</p>
                  <p className="text-sm text-gray-400">Contact Updated</p>
                  <p className="text-xs text-gray-500">Today, 9:15 AM</p>
                </div>
                <div className="border-l-2 border-yellow-500 pl-4 py-1">
                  <p className="font-medium">Jarvis Automation</p>
                  <p className="text-sm text-gray-400">Email Follow-up Sent</p>
                  <p className="text-xs text-gray-500">Yesterday, 3:45 PM</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-4 py-1">
                  <p className="font-medium">Settings Updated</p>
                  <p className="text-sm text-gray-400">API Keys Configured</p>
                  <p className="text-xs text-gray-500">Yesterday, 11:20 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="h-5 w-5 text-blue-400 mr-2" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/chat" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-blue-400" />
                    <span>AI Chat</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Chat with your AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Get answers to questions and take actions through natural language</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/meetings" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-blue-400" />
                    <span>Meetings</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Analyze meeting recordings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Upload, transcribe, and get AI-powered insights from your meetings</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/settings" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-400" />
                    <span>Settings</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Manage API keys, preferences, and integration settings</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/documentation" className="block hover:no-underline">
              <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <PanelRightOpen className="h-5 w-5 text-blue-400" />
                    <span>Documentation</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Learn how to use Jarvis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Access guides, tutorials, and integration examples</p>
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
