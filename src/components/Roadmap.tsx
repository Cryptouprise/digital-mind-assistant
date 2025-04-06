
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type RoadmapItem = {
  title: string;
  completed: boolean;
  phase: 1 | 2;
};

const roadmapItems: RoadmapItem[] = [
  // Phase 1: Core SaaS Functionality
  { title: "AI Command Console", completed: true, phase: 1 },
  { title: "Meetings Dashboard Enhancements", completed: true, phase: 1 },
  { title: "Settings Page", completed: true, phase: 1 },
  { title: "White-Label Features", completed: true, phase: 1 },
  { title: "Admin Jarvis Mode", completed: true, phase: 1 },
  { title: "GHL Deep Integration", completed: true, phase: 1 },
  
  // Phase 2: Symbl Real-Time Intelligence Layer
  { title: "Install and Wire Symbl JavaScript SDK", completed: true, phase: 2 },
  { title: "Add Symbl Insights UI Component", completed: false, phase: 2 },
  { title: "Save conversationId to Supabase", completed: false, phase: 2 },
  { title: "Optional: Start Live Meeting Button", completed: false, phase: 2 },
];

export function Roadmap() {
  const phase1Items = roadmapItems.filter(item => item.phase === 1);
  const phase2Items = roadmapItems.filter(item => item.phase === 2);
  
  const phase1Progress = Math.round(
    (phase1Items.filter(item => item.completed).length / phase1Items.length) * 100
  );
  
  const phase2Progress = Math.round(
    (phase2Items.filter(item => item.completed).length / phase2Items.length) * 100
  );
  
  const totalProgress = Math.round(
    (roadmapItems.filter(item => item.completed).length / roadmapItems.length) * 100
  );

  // Get next priorities (first 3 uncompleted items)
  const nextPriorities = roadmapItems
    .filter(item => !item.completed)
    .slice(0, 3)
    .map(item => item.title);

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span>Implementation Progress</span>
          </div>
          <span className="text-sm bg-blue-900 px-3 py-1 rounded-full">
            {totalProgress}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center justify-between mb-2">
              <span>Phase 1: Core SaaS Functionality</span>
              <span className="text-sm text-blue-400">{phase1Progress}%</span>
            </h3>
            <Progress value={phase1Progress} className="h-2 bg-slate-700 mb-2" />
            <ul className="mt-2 space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {phase1Items.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                  <span className={item.completed ? "text-green-400" : "text-gray-400"}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold flex items-center justify-between mb-2">
              <span>Phase 2: Symbl Real-Time Intelligence Layer</span>
              <span className="text-sm text-blue-400">{phase2Progress}%</span>
            </h3>
            <Progress value={phase2Progress} className="h-2 bg-slate-700 mb-2" />
            <ul className="mt-2 space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {phase2Items.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                  <span className={item.completed ? "text-green-400" : "text-gray-400"}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {nextPriorities.length > 0 && (
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                Next Priorities:
              </h3>
              <ul className="space-y-2 pl-6 list-disc">
                {nextPriorities.map((priority, index) => (
                  <li key={index} className="text-blue-400">{priority}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
