
import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

const Navigation = ({ darkTheme = false }) => {
  const bgClass = darkTheme ? "bg-slate-950 text-white" : "bg-white border-b";

  return (
    <header className={`${bgClass} shadow-md`}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className={`h-6 w-6 ${darkTheme ? "text-blue-400" : "text-primary"}`} />
          <Link to="/" className="text-xl font-bold">Jarvis AI</Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
          <Link to="/meetings" className="text-sm font-medium hover:underline">
            Meetings
          </Link>
          <Link to="/chat" className="text-sm font-medium hover:underline">
            Chat
          </Link>
          <Link to="/settings" className="text-sm font-medium hover:underline">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
