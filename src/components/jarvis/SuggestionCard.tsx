
import React from 'react';
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick
}) => {
  return (
    <Card 
      className="p-4 shadow-md hover:shadow-lg cursor-pointer bg-slate-800 border-slate-700 text-white" 
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="text-blue-400" size={20} />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default SuggestionCard;
