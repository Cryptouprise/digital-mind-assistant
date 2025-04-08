
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Tag, Users, BarChart } from "lucide-react";
import GHLActionCard from './GHLActionCard';
import { toast } from "sonner";
import { jarvisActions } from "@/utils/jarvisActions";

const GHLIntegrations: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const handleAction = async (actionType: string) => {
    setIsProcessing(true);
    
    try {
      // These would typically use actual data in a real implementation
      // For now, we'll just show toasts to demonstrate UI feedback
      switch(actionType) {
        case 'bulk-message':
          toast.info("Preparing bulk message feature...");
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
          toast.success("Analytics report ready!");
          break;
      }
    } catch (error) {
      console.error("GHL action failed:", error);
      toast.error(`Failed to perform ${actionType} action`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          GHL Integrations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GHLActionCard
            title="Bulk Messaging"
            description="Send personalized messages to multiple contacts"
            icon={<MessageSquare className="h-5 w-5 text-blue-400" />}
            buttonText="Create Message"
            onClick={() => handleAction('bulk-message')}
            disabled={isProcessing}
          />
          
          <GHLActionCard
            title="Launch Campaign"
            description="Start new marketing campaign for contacts"
            icon={<Calendar className="h-5 w-5 text-green-400" />}
            buttonText="Create Campaign"
            onClick={() => handleAction('campaign')}
            disabled={isProcessing}
          />
          
          <GHLActionCard
            title="Contact Tagging"
            description="Manage tags for your contact database"
            icon={<Tag className="h-5 w-5 text-yellow-400" />}
            buttonText="Manage Tags"
            onClick={() => handleAction('tag')}
            disabled={isProcessing}
          />
          
          <GHLActionCard
            title="Pipeline Management"
            description="Update and manage your sales pipeline"
            icon={<Users className="h-5 w-5 text-purple-400" />}
            buttonText="View Pipeline"
            onClick={() => handleAction('opportunity')}
            disabled={isProcessing}
          />
          
          <GHLActionCard
            title="GHL Analytics"
            description="Generate reports and insights from your GHL data"
            icon={<BarChart className="h-5 w-5 text-red-400" />}
            buttonText="View Analytics"
            onClick={() => handleAction('analytics')}
            disabled={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GHLIntegrations;
