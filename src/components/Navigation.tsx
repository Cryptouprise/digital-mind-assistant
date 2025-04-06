
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BrainCircuit, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const isOnMeetingsPage = location.pathname === "/meetings";

  return (
    <nav className="bg-slate-950 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-6 w-6 text-blue-400" />
        <h1 className="text-xl font-bold">Jarvis AI</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="space-x-4">
          <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link to="/meetings" className="hover:text-blue-400 transition-colors">Meetings</Link>
          <Link to="/chat" className="hover:text-blue-400 transition-colors">Chat</Link>
          <Link to="/settings" className="hover:text-blue-400 transition-colors">Settings</Link>
        </div>
        {isOnMeetingsPage && (
          <Button 
            variant="outline" 
            size="sm"
            className="ml-4 flex items-center gap-1"
            onClick={() => {
              // Find the credentials dialog open button and click it
              const credentialsBtn = document.querySelector('[data-credentials-button="true"]');
              if (credentialsBtn instanceof HTMLButtonElement) {
                credentialsBtn.click();
              }
            }}
          >
            <KeyRound className="h-4 w-4" />
            Symbl Credentials
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
