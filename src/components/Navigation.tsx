
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Settings,
  History,
  CalendarCheck,
  AlignJustify,
  Database,
  Search,
  Users,
  Home,
  BrainCircuit,
  Terminal
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const links = [
    { to: "/", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { to: "/chat", label: "Chat", icon: <MessageSquare className="h-5 w-5" /> },
    { to: "/meetings", label: "Meetings", icon: <CalendarCheck className="h-5 w-5" /> },
    { to: "/leads", label: "Leads", icon: <Users className="h-5 w-5" /> },
    { to: "/history", label: "History", icon: <History className="h-5 w-5" /> },
    { to: "/jarvis", label: "Jarvis", icon: <BrainCircuit className="h-5 w-5" /> },
    { to: "/command-center", label: "Command Center", icon: <Terminal className="h-5 w-5" /> },
    { to: "/search", label: "Search", icon: <Search className="h-5 w-5" /> },
    { to: "/admin", label: "Admin", icon: <Database className="h-5 w-5" /> },
    { to: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed w-full z-50 top-0 border-b border-slate-700 shadow-lg bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white flex items-center">
              <BrainCircuit className="h-6 w-6 mr-2 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent hidden md:inline">Jarvis AI</span>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent md:hidden">J</span>
            </Link>

            {!isMobile && (
              <nav className="ml-10 flex items-center space-x-1">
                {links.map((link) => (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={isActive(link.to) ? "secondary" : "ghost"}
                      size="sm"
                      className={`${
                        isActive(link.to)
                          ? "bg-blue-900/50 text-blue-100"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      } flex items-center px-3`}
                    >
                      {link.icon}
                      <span className="ml-2">{link.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-blue-900 hover:bg-blue-800 transition-colors">
              <AvatarFallback className="text-sm text-blue-200">J</AvatarFallback>
            </Avatar>
            
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="ml-2"
              >
                <AlignJustify className="h-5 w-5 text-slate-300" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMobileMenuOpen && (
          <div className="md:hidden py-2 pb-4 border-t border-slate-700">
            <nav className="grid grid-cols-2 gap-2 mt-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.to) ? "secondary" : "ghost"}
                    size="sm"
                    className={`${
                      isActive(link.to)
                        ? "bg-blue-900/50 text-blue-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    } flex items-center justify-start w-full px-3`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
