
import { useEffect } from 'react';

// Add TypeScript declaration for the Symbl UI global object
declare global {
  interface Window {
    SymblInsightsUI: {
      render: (config: any) => void;
    };
  }
}

interface SymblWidgetProps {
  accessToken: string;
  conversationId: string;
}

const SymblWidget = ({ accessToken, conversationId }: SymblWidgetProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.symbl.ai/js/insights-ui/1.0.0/symbl-insights-ui.min.js';
    script.async = true;
    script.onload = () => {
      if (window.SymblInsightsUI) {
        window.SymblInsightsUI.render({
          accessToken,
          conversationId,
          elementId: 'symbl-insights-ui',
          config: {
            showTopics: true,
            showActionItems: true,
            showFollowUps: true,
            showAnalytics: true,
          },
        });
      }
    };
    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [accessToken, conversationId]);

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-2">Meeting Insights</h3>
      <div id="symbl-insights-ui" className="w-full mt-4 min-h-[300px] bg-slate-900/50 rounded-lg" />
    </div>
  );
};

export default SymblWidget;
