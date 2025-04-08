
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Tag, Users, BarChart, RefreshCw } from "lucide-react";
import GHLActionCard from './GHLActionCard';
import { toast } from "sonner";
import { jarvisActions } from "@/utils/jarvisActions";
import { Button } from "@/components/ui/button";

const GHLIntegrations: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const handleAction = async (actionType: string) => {
    setIsProcessing(true);
    setProcessingAction(actionType);
    
    try {
      // These would typically use actual data in a real implementation
      // For now, we'll just show toasts to demonstrate UI feedback
      switch(actionType) {
        case 'bulk-message':
          toast.info("Preparing bulk message feature...");
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
          toast.success("Bulk message demo initiated!");
          break;
          
        case 'campaign':
          toast.info("Setting up new campaign...");
          // Sample payload - in real implementation, this would come from a form or selected data
          await jarvisActions.launchWorkflow("sample-workflow-id", "sample-contact-id");
          toast.success("Campaign launched successfully!");
          break;
          
        case 'tag':
          toast.info("Processing tag action...");
          await jarvisActions.addTag("sample-contact-id", "sample-tag-id");
          toast.success("Tag added to contact!");
          break;
          
        case 'opportunity':
          toast.info("Moving pipeline stage...");
          await jarvisActions.movePipelineStage("sample-opportunity-id", "new-stage-id");
          toast.success("Pipeline stage updated!");
          break;
          
        case 'analytics':
          toast.info("Generating GHL analytics report...");
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
          toast.success("Analytics report ready!");
          break;
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("GHL action failed:", error);
      toast.error(`Failed to perform ${actionType} action`);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };
  
  const refreshGHLData = () => {
    toast.info("Refreshing GHL integration data...");
    // In a real implementation, this would fetch fresh data from GHL
    setTimeout(() => {
      setLastUpdated(new Date());
      toast.success("GHL data refreshed successfully");
    }, 1000);
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg flex items-center gap-2">
          GHL Integrations
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshGHLData} 
          className="border-slate-600 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-gray-500 mb-4">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GHLActionCard
            title="Bulk Messaging"
            description="Send personalized messages to multiple contacts"
            icon={<MessageSquare className="h-5 w-5 text-blue-400" />}
            buttonText="Create Message"
            onClick={() => handleAction('bulk-message')}
            disabled={isProcessing && processingAction === 'bulk-message'}
            hoverDetails="Send SMS, email, or voice messages to multiple contacts at once with personalized fields and scheduling options."
          />
          
          <GHLActionCard
            title="Launch Campaign"
            description="Start new marketing campaign for contacts"
            icon={<Calendar className="h-5 w-5 text-green-400" />}
            buttonText="Create Campaign"
            onClick={() => handleAction('campaign')}
            disabled={isProcessing && processingAction === 'campaign'}
            hoverDetails="Create automated marketing sequences with multiple touchpoints across channels to nurture leads and drive conversions."
          />
          
          <GHLActionCard
            title="Contact Tagging"
            description="Manage tags for your contact database"
            icon={<Tag className="h-5 w-5 text-yellow-400" />}
            buttonText="Manage Tags"
            onClick={() => handleAction('tag')}
            disabled={isProcessing && processingAction === 'tag'}
            hoverDetails="Organize contacts with custom tags to segment your audience for targeted marketing campaigns and follow-ups."
          />
          
          <GHLActionCard
            title="Pipeline Management"
            description="Update and manage your sales pipeline"
            icon={<Users className="h-5 w-5 text-purple-400" />}
            buttonText="View Pipeline"
            onClick={() => handleAction('opportunity')}
            disabled={isProcessing && processingAction === 'opportunity'}
            hoverDetails="Track deals through your sales funnel, update opportunity stages, and manage revenue forecasts in real-time."
          />
          
          <GHLActionCard
            title="GHL Analytics"
            description="Generate reports and insights from your GHL data"
            icon={<BarChart className="h-5 w-5 text-red-400" />}
            buttonText="View Analytics"
            onClick={() => handleAction('analytics')}
            disabled={isProcessing && processingAction === 'analytics'}
            hoverDetails="Access comprehensive reports on contact activity, campaign performance, conversion rates, and revenue metrics."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GHLIntegrations;
