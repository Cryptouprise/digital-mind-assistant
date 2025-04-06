
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertCircle, HelpCircle, CalendarPlus } from 'lucide-react';

interface Insight {
  id: string;
  type: string;
  text: string;
  confidence?: number;
  assignee?: string;
}

interface InsightsListProps {
  insights: string[] | Insight[];
  symblToken?: string;
  conversationId?: string;
}

const InsightsList = ({ insights: initialInsights, symblToken, conversationId }: InsightsListProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // Process initial insights
  useEffect(() => {
    // Handle both string array and Insight array
    if (initialInsights && initialInsights.length > 0) {
      if (typeof initialInsights[0] === 'string') {
        setInsights((initialInsights as string[]).map((text, i) => ({
          id: `local-${i}`,
          type: 'insight',
          text
        })));
      } else {
        setInsights(initialInsights as Insight[]);
      }
    }
  }, [initialInsights]);

  // Connect to real Symbl insights if token and conversationId are provided
  useEffect(() => {
    if (symblToken && conversationId) {
      // Poll for insights every 10 seconds
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`https://api.symbl.ai/v1/conversations/${conversationId}/insights`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${symblToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.insights && data.insights.length > 0) {
              setInsights(data.insights.map((insight: any) => ({
                id: insight.id,
                type: insight.type,
                text: insight.text,
                confidence: insight.confidence,
                assignee: insight.assignee
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching insights:', error);
        }
      }, 10000);
      
      return () => clearInterval(pollInterval);
    }
  }, [symblToken, conversationId]);

  // Helper to get badge color based on insight type
  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'action item':
        return 'default';
      case 'question':
        return 'outline';
      case 'follow-up':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Helper to get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'action item':
        return <CalendarPlus className="h-3 w-3" />;
      case 'question':
        return <HelpCircle className="h-3 w-3" />;
      case 'follow-up':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Lightbulb className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-md p-4 border border-slate-800">
      <h3 className="text-sm font-medium mb-3 flex items-center">
        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
        Real-Time Insights
      </h3>
      
      {insights.length === 0 ? (
        <div className="text-center py-8 bg-slate-800/50 rounded-md border border-dashed border-slate-700">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p className="text-slate-400 text-sm mb-1">No insights detected yet</p>
          <p className="text-xs text-slate-500">Insights will appear here as they're detected</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {insights.map((insight) => (
            <li key={insight.id} className="text-sm bg-slate-800 p-3 rounded-md border-l-2 border-yellow-500 hover:bg-slate-800/80 transition-colors">
              <div className="flex justify-between items-start mb-2">
                {insight.type && (
                  <Badge variant={getBadgeVariant(insight.type)} className="flex items-center gap-1">
                    {getInsightIcon(insight.type)}
                    {insight.type}
                  </Badge>
                )}
                {insight.confidence && (
                  <span className="text-xs text-slate-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                )}
              </div>
              <p className="text-slate-300">{insight.text}</p>
              {insight.assignee && (
                <div className="mt-2 text-xs text-slate-400">
                  Assigned to: {insight.assignee}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsList;
