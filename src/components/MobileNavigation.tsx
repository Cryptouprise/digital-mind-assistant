
import React from "react";
import { Link } from "react-router-dom";
import { Home, MessageCircle, Settings, Video } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MobileNavigation = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-slate-700 hover:bg-slate-600 border-slate-600">
          <Home className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] bg-slate-800 border-slate-700 text-white p-4">
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          
          <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 py-3 px-3 rounded-md hover:bg-slate-700 transition-colors">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          
          <Link to="/meetings" className="flex items-center gap-2 bg-blue-600/20 text-white py-3 px-3 rounded-md hover:bg-slate-700 transition-colors">
            <Video className="h-5 w-5" />
            Meetings
          </Link>
          
          <Link to="/chat" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 py-3 px-3 rounded-md hover:bg-slate-700 transition-colors">
            <MessageCircle className="h-5 w-5" />
            Chat
          </Link>
          
          <Link to="/settings" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 py-3 px-3 rounded-md hover:bg-slate-700 transition-colors">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
