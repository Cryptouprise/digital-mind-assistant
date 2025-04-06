
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrainCircuit, KeyRound, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const isOnMeetingsPage = location.pathname === "/meetings";
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <nav className="bg-slate-950 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">Jarvis AI</h1>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
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
                const event = new CustomEvent('open-symbl-credentials');
                window.dispatchEvent(event);
                
                toast({
                  title: "Opening credentials form",
                  description: "Enter your Symbl API credentials"
                });
              }}
            >
              <KeyRound className="h-4 w-4" />
              Symbl Credentials
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-2">
          <div className="flex flex-col space-y-4">
            <Link to="/" 
              className="block py-2 px-4 hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link to="/meetings" 
              className="block py-2 px-4 hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meetings
            </Link>
            <Link to="/chat" 
              className="block py-2 px-4 hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link to="/settings" 
              className="block py-2 px-4 hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            {isOnMeetingsPage && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 w-fit"
                onClick={() => {
                  const event = new CustomEvent('open-symbl-credentials');
                  window.dispatchEvent(event);
                  setMobileMenuOpen(false);
                  
                  toast({
                    title: "Opening credentials form",
                    description: "Enter your Symbl API credentials"
                  });
                }}
              >
                <KeyRound className="h-4 w-4" />
                Symbl Credentials
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
