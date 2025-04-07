
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Settings, Video, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const MobileNavigation = () => {
  const location = useLocation();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 border-blue-500">
          <Menu className="h-4 w-4 text-white" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] bg-slate-900 border-slate-700 text-white p-4">
        <nav className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          
          <NavLink to="/" icon={<Home className="h-5 w-5" />} label="Dashboard" isActive={location.pathname === "/"} />
          <NavLink to="/meetings" icon={<Video className="h-5 w-5" />} label="Meetings" isActive={location.pathname === "/meetings"} />
          <NavLink to="/chat" icon={<MessageCircle className="h-5 w-5" />} label="Chat" isActive={location.pathname === "/chat"} />
          <NavLink to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" isActive={location.pathname === "/settings"} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

const NavLink = ({ to, icon, label, isActive }: { to: string, icon: React.ReactNode, label: string, isActive: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-2 py-3 px-3 rounded-md transition-colors ${
      isActive
        ? "bg-blue-600/20 text-white"
        : "text-blue-400 hover:text-blue-300 hover:bg-slate-800"
    }`}
  >
    {icon}
    {label}
  </Link>
);

export default MobileNavigation;
