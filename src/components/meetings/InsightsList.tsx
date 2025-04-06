
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  AlertCircle, 
  HelpCircle, 
  CalendarPlus, 
  TrendingUp,
  BarChart
} from 'lucide-react';
import { 
  Card,
  CardContent
} from "@/components/ui/card";

interface Insight {
  id: string;
  type: string;
  text: string;
  confidence?: number;
  assignee?: string;
  score?: number;
}

interface InsightsListProps {
  insights: string[] | Insight[];
  symblToken?: string;
  conversationId?: string;
}

const InsightsList = ({ insights: initialInsights, symblToken, conversationId }: InsightsListProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  
  // Sample metrics for demo - in production these would come from Symbl API
  const callMetrics = {
    callScore: 85,
    communicationScore: 90,
    forwardMotion: 96,
    questionHandling: 84,
    salesProcess: 72
  };
  
  // Process initial insights
  useEffect(() => {
    // Handle both string array and Insight array
    if (initialInsights && initialInsights.length > 0) {
      if (typeof initialInsights[0] === 'string') {
        setInsights((initialInsights as string[]).map((text, i) => ({
          id: `local-${i}`,
          type: determineInsightType(text),
          text,
          confidence: Math.random() * 0.3 + 0.7, // Random confidence between 70% and 100%
          score: Math.floor(Math.random() * 30) + 70 // Random score between 70 and 100
        })));
      } else {
        setInsights(initialInsights as Insight[]);
      }
    }
  }, [initialInsights]);

  // Helper to determine insight type based on text content
  const determineInsightType = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('follow up') || lowerText.includes('follow-up')) return 'follow-up';
    if (lowerText.includes('?') || lowerText.includes('what') || lowerText.includes('how') || lowerText.includes('when')) return 'question';
    if (lowerText.includes('need to') || lowerText.includes('should') || lowerText.includes('must')) return 'action item';
    return 'insight';
  };

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
  
  // Toggle expanded insight
  const toggleExpand = (id: string) => {
    if (expandedInsight === id) {
      setExpandedInsight(null);
    } else {
      setExpandedInsight(id);
    }
  };

  return (
    <div>
      {/* Call Metrics Section - Similar to Symbl UI */}
      <Card className="mb-4 bg-slate-800/60 border-slate-700">
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium flex items-center mb-3">
            <BarChart className="mr-2 h-4 w-4 text-blue-400" />
            Call Score
          </h3>
          
          <div className="flex items-center mb-3">
            <div className="p-1 bg-green-600/20 rounded-full">
              <span className="text-green-400 text-lg font-semibold px-1">{callMetrics.callScore}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Communication</span>
                <span className="font-medium text-blue-400">{callMetrics.communicationScore}/100</span>
              </div>
              <div className="mt-1 bg-slate-600 h-1.5 rounded overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${callMetrics.communicationScore}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Forward Motion</span>
                <span className="font-medium text-green-400">{callMetrics.forwardMotion}/100</span>
              </div>
              <div className="mt-1 bg-slate-600 h-1.5 rounded overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${callMetrics.forwardMotion}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Question Handling</span>
                <span className="font-medium text-yellow-400">{callMetrics.questionHandling}/100</span>
              </div>
              <div className="mt-1 bg-slate-600 h-1.5 rounded overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${callMetrics.questionHandling}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded p-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Sales Process</span>
                <span className="font-medium text-purple-400">{callMetrics.salesProcess}/100</span>
              </div>
              <div className="mt-1 bg-slate-600 h-1.5 rounded overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${callMetrics.salesProcess}%` }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Insights Section */}
      <div className="bg-slate-900/60 rounded-md p-4 border border-slate-800">
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
          Meeting Insights
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
              <li 
                key={insight.id} 
                className={`bg-slate-800 rounded-md border-l-2 hover:bg-slate-800/80 transition-colors ${
                  expandedInsight === insight.id ? 'border-yellow-500' : 'border-yellow-500/50'
                }`}
                onClick={() => toggleExpand(insight.id)}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    {insight.type && (
                      <Badge variant={getBadgeVariant(insight.type)} className="flex items-center gap-1">
                        {getInsightIcon(insight.type)}
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                    )}
                    {insight.confidence && (
                      <span className="text-xs text-slate-500">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{insight.text}</p>
                  
                  {expandedInsight === insight.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Score: {insight.score || Math.round(insight.confidence ? insight.confidence * 100 : 75)}/100</span>
                        {insight.assignee && <span>Assigned to: {insight.assignee}</span>}
                        <button className="text-blue-400 hover:text-blue-300">Add Note</button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InsightsList;
