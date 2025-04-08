
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend = "neutral",
  description,
  isLoading = false,
  onClick
}) => {
  return (
    <Card 
      className={`bg-slate-800 border-slate-700 text-white hover:bg-slate-750 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-gray-400">{title}</div>
            <div className="text-2xl font-bold mt-1">
              {isLoading ? "Loading..." : value}
            </div>
            {description && (
              <div className="text-xs text-gray-500 mt-1">{description}</div>
            )}
          </div>
          <div className="rounded-full bg-slate-700/50 p-2">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center mt-3 text-sm">
            {trend === "up" && (
              <span className="flex items-center text-green-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>Increasing</span>
              </span>
            )}
            {trend === "down" && (
              <span className="flex items-center text-red-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>Decreasing</span>
              </span>
            )}
            {trend === "neutral" && (
              <span className="flex items-center text-blue-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                </svg>
                <span>Stable</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
