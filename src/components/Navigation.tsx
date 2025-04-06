
import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

const Navigation = () => {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-bold">Digital Mind Assistant</Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium">
            Home
          </Link>
          <Link to="/chat" className="text-sm font-medium">
            Chat
          </Link>
          <Link to="/settings" className="text-sm font-medium">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
