
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
  LineChart,
  Users,
  BarChart2,
  Zap
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Roadmap } from "@/components/Roadmap";
import { supabase } from "@/integrations/supabase/client";
import { Meeting, fetchMeeting, fetchMeetings } from "@/utils/symblClient";
import NotificationCenter from "@/components/NotificationCenter";
import LeadSmartCard from "@/components/LeadSmartCard";
import { LeadProps } from "@/components/LeadSmartCard";
import MetricsCard from "@/components/MetricsCard";
import RecentMeetingSummary from "@/components/RecentMeetingSummary";
import GHLIntegrations from "@/components/GHLIntegrations";
import { toast } from "sonner";

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
    { name: 'Sarah Johnson', email: 'sarah@example.org', stage: 'Negotiation', status: 'Hot', lastTouch: '1 day ago' },
    { name: 'Alex Wong', email: 'alex@company.net', stage: 'Discovery', status: 'Warm', lastTouch: '3 days ago' },
  ]);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase.functions.invoke('dashboard-stats');
      
      if (statsError) {
        console.error("Error fetching dashboard stats:", statsError);
        toast.error("Failed to load dashboard statistics");
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
      toast.error("Error loading dashboard data");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
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
            <MetricsCard
              title="Meetings Processed"
              value={isLoading ? "Loading..." : liveStats.meetings}
              icon={<CalendarCheck className="h-5 w-5 text-blue-400" />}
              trend="up"
              description="Total recorded meetings"
              isLoading={isLoading}
            />
            <MetricsCard
              title="Active Campaigns"
              value={isLoading ? "Loading..." : liveStats.campaigns}
              icon={<BarChart2 className="h-5 w-5 text-green-400" />}
              trend="neutral"
              description="Marketing campaigns"
              isLoading={isLoading}
            />
            <MetricsCard
              title="Follow-ups Generated"
              value={isLoading ? "Loading..." : liveStats.followUps}
              icon={<MessageSquareText className="h-5 w-5 text-yellow-400" />}
              trend="up"
              description="From conversations"
              isLoading={isLoading}
            />
          </div>

          {/* GHL Actions */}
          <div className="mb-8">
            <GHLIntegrations />
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <NotificationCenter />
          </div>

          {/* Two Column Layout for Summary and Leads */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <RecentMeetingSummary 
                meeting={liveStats.lastMeeting}
                isLoading={isLoading}
                onRefresh={fetchDashboardData}
              />
            </div>
            
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700 text-white h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/30 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Follow up with Mark Price</p>
                      <p className="text-xs text-slate-400">Due in 2 days</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-800/30 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Send proposal to Jane Doe</p>
                      <p className="text-xs text-slate-400">Due tomorrow</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/30 flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Schedule demo with Acme Co</p>
                      <p className="text-xs text-slate-400">Due in 5 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* High Priority Leads */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-400 mr-2" />
              High Priority Leads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Zap className="h-5 w-5 text-blue-400 mr-2" />
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
