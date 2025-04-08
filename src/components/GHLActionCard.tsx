
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GHLActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}

const GHLActionCard: React.FC<GHLActionCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
  disabled = false
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700 text-white h-full">
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
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GHLActionCard;
