
import React from 'react';

interface InsightsListProps {
  insights: string[];
}

const InsightsList = ({ insights }: InsightsListProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Real-Time Insights</h3>
      {insights.length === 0 ? (
        <p className="text-gray-500 text-sm">No insights detected yet...</p>
      ) : (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm bg-slate-700 p-2 rounded">{insight}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsList;
