
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface GHLActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  hoverDetails?: string;
}

const GHLActionCard: React.FC<GHLActionCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  disabled = false,
  hoverDetails
}) => {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Card className="bg-slate-800 border-slate-700 text-white h-full transition-all duration-200 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {icon}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 text-sm">
            <p>{description}</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={onClick}
              disabled={disabled}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-lg disabled:bg-slate-700"
            >
              {disabled ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          </CardFooter>
        </Card>
      </HoverCardTrigger>
      
      {hoverDetails && (
        <HoverCardContent className="w-80 bg-slate-800 border-slate-700 text-white">
          <div className="text-sm">
            {hoverDetails}
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );
};

export default GHLActionCard;
