
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
    <nav className="bg-slate-950 text-white p-4 shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">Jarvis AI</h1>
        </div>
        
        {/* Mobile menu button - highly visible with contrast */}
        <div className="md:hidden">
          <Button 
            variant="default" 
            size="sm" 
            onClick={toggleMobileMenu} 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span>Menu</span>
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
      
      {/* Improved mobile menu with better visibility and position */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-slate-800 rounded-lg border border-blue-600 fixed left-4 right-4 p-2 z-50 shadow-lg shadow-blue-900/20">
          <div className="flex flex-col space-y-1">
            <Link to="/" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link to="/meetings" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meetings
            </Link>
            <Link to="/chat" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link to="/settings" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-medium transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            {isOnMeetingsPage && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 mx-4 my-2 bg-blue-600 text-white hover:bg-blue-700"
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

      {/* Dark overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
