import React, { useState, useEffect } from "react";
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
  Clock,
  CheckCircle,
  LineChart
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Roadmap } from "@/components/Roadmap";
import { supabase } from "@/integrations/supabase/client";
import { Meeting, fetchMeeting, fetchMeetings } from "@/utils/symblClient";
import NotificationCenter from "@/components/NotificationCenter";
import LeadSmartCard from "@/components/LeadSmartCard";
import { LeadProps } from "@/components/LeadSmartCard";

const Index = () => {
  const isMobile = useIsMobile();
  const [liveStats, setLiveStats] = useState({
    meetings: 0,
    campaigns: 0,
    followUps: 0,
    lastMeeting: null as Meeting | null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [latestMeetingSummary, setLatestMeetingSummary] = useState("");
  const [highPriorityLeads, setHighPriorityLeads] = useState<LeadProps[]>([
    { name: 'Jane Doe', email: 'jane@example.com', stage: 'Discovery', status: 'Hot', lastTouch: '2 days ago' },
    { name: 'Mark Price', email: 'mark@brand.io', stage: 'Proposal', status: 'Warm', lastTouch: '5 days ago' },
  ]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch dashboard stats
        const { data: statsData, error: statsError } = await supabase.functions.invoke('dashboard-stats');
        
        if (statsError) {
          console.error("Error fetching dashboard stats:", statsError);
        } else if (statsData) {
          setLiveStats({
            meetings: statsData.meetings || 0,
            campaigns: statsData.campaigns || 0,
            followUps: statsData.followUps || 0,
            lastMeeting: null
          });
        }
        
        // Fetch meetings
        const meetings = await fetchMeetings();
        
        // Get latest meeting with a summary
        const completedMeetings = meetings.filter(m => 
          m.status === 'completed' && m.summary);
          
        let lastMeeting = null;
        let summaryText = "No recent meeting summaries available.";
        
        if (completedMeetings.length > 0) {
          lastMeeting = completedMeetings[0];
          summaryText = lastMeeting.summary || summaryText;
          
          setLiveStats(prev => ({
            ...prev,
            lastMeeting
          }));
        }
        
        setLatestMeetingSummary(summaryText);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Updated stats data to reflect project completion and live data
  const stats = [
    { 
      title: "Meetings Processed", 
      value: isLoading ? "Loading..." : liveStats.meetings.toString(), 
      change: "Synced", 
      trend: "up", 
      description: "Total recorded meetings"
    },
    { 
      title: "Active Campaigns", 
      value: isLoading ? "Loading..." : liveStats.campaigns.toString(), 
      change: "Active", 
      trend: "up", 
      description: "Marketing campaigns" 
    },
    { 
      title: "Follow-ups Generated", 
      value: isLoading ? "Loading..." : liveStats.followUps.toString(), 
      change: "Ready", 
      trend: "up", 
      description: "From conversations" 
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
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <NotificationCenter />
          </div>

          {/* Symbl Meeting Summary */}
          <Card className="bg-slate-800 border-slate-700 text-white mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-400" />
                Latest Meeting Summary
              </CardTitle>
              <CardDescription className="text-gray-400">
                {isLoading ? "Loading meeting data..." : (liveStats.lastMeeting ? 
                  `From "${liveStats.lastMeeting.title}" on ${new Date(liveStats.lastMeeting.date).toLocaleDateString()}` : 
                  "No recent meetings with summaries")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <p className="text-gray-400">Loading summary data...</p>
                </div>
              ) : (
                <div className="bg-slate-700/50 p-4 rounded-md">
                  <p className="text-sm whitespace-pre-line text-slate-300">
                    {latestMeetingSummary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* High Priority Leads */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Activity className="h-5 w-5 text-blue-400 mr-2" />
              High Priority Leads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highPriorityLeads.map((lead, i) => (
                <LeadSmartCard key={i} lead={lead} />
              ))}
            </div>
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
                <div className="border-l-2 border-green-500 pl-4 py-1">
                  <p className="font-medium">Project Completed!</p>
                  <p className="text-sm text-gray-400">All features implemented</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="border-l-2 border-blue-500 pl-4 py-1">
                  <p className="font-medium">Symbl Realtime Added</p>
                  <p className="text-sm text-gray-400">Live Meeting Intelligence</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="border-l-2 border-yellow-500 pl-4 py-1">
                  <p className="font-medium">Jarvis Automation</p>
                  <p className="text-sm text-gray-400">Admin Automation Features</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
                <div className="border-l-2 border-purple-500 pl-4 py-1">
                  <p className="font-medium">GHL Integration</p>
                  <p className="text-sm text-gray-400">Deep CRM Connection</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
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
