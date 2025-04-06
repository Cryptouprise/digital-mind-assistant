
import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="bg-slate-950 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-6 w-6 text-blue-400" />
        <h1 className="text-xl font-bold">Jarvis AI</h1>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
        <Link to="/meetings" className="hover:text-blue-400 transition-colors">Meetings</Link>
        <Link to="/chat" className="hover:text-blue-400 transition-colors">Chat</Link>
        <Link to="/settings" className="hover:text-blue-400 transition-colors">Settings</Link>
      </div>
    </nav>
  );
};

export default Navigation;
