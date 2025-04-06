
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Real-Time Insights</h3>
      {insights.length === 0 ? (
        <p className="text-gray-500 text-sm">No insights detected yet...</p>
      ) : (
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {insights.map((insight) => (
            <li key={insight.id} className="text-sm bg-slate-700 p-2 rounded flex flex-col">
              {insight.type && (
                <Badge variant={getBadgeVariant(insight.type)} className="self-start mb-1">
                  {insight.type}
                </Badge>
              )}
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsList;
