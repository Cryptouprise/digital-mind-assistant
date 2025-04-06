
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - could later be pulled from Supabase
const mockMeetings = [
  {
    id: "123",
    title: "AI Strategy Session",
    date: "2024-04-01",
    summary: "Talked through onboarding AI into their sales process and identified follow-up opportunities."
  },
  {
    id: "456",
    title: "Demo with Loan Broker",
    date: "2024-04-02",
    summary: "Explained system architecture and recommended automation for follow-ups."
  }
];

const Meetings = () => {
  const [meetings, setMeetings] = useState<Array<{
    id: string;
    title: string;
    date: string;
    summary: string;
  }>>([]);

  useEffect(() => {
    // This will later be pulled from Supabase or an API
    setMeetings(mockMeetings);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">
      <Navigation darkTheme={true} />
      
      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-blue-400" />
            <h1 className="text-3xl font-bold">Meeting Insights</h1>
          </div>
          <Link to="/" className="flex items-center text-blue-400 hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="bg-slate-800 border-slate-700 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">{meeting.title}</CardTitle>
                <p className="text-sm text-gray-400">{meeting.date}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{meeting.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Meetings;
