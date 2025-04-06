
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
    <nav className="bg-blue-900 text-white p-4 shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold">Jarvis AI</h1>
        </div>
        
        {/* Extremely visible mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={toggleMobileMenu} 
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-2 border-white px-4 py-2"
          >
            <span className="font-bold">MENU</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-400 transition-colors font-medium">Dashboard</Link>
            <Link to="/meetings" className="hover:text-blue-400 transition-colors font-medium">Meetings</Link>
            <Link to="/chat" className="hover:text-blue-400 transition-colors font-medium">Chat</Link>
            <Link to="/settings" className="hover:text-blue-400 transition-colors font-medium">Settings</Link>
          </div>
          {isOnMeetingsPage && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 flex items-center gap-1 bg-blue-700 text-white hover:bg-blue-800"
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
      
      {/* Highly visible mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-blue-800 rounded-lg border-4 border-white fixed left-4 right-4 p-2 z-50 shadow-lg">
          <div className="flex flex-col space-y-1">
            <Link to="/" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-bold transition-colors text-center text-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link to="/meetings" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-bold transition-colors text-center text-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meetings
            </Link>
            <Link to="/chat" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-bold transition-colors text-center text-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chat
            </Link>
            <Link to="/settings" 
              className="block py-3 px-4 hover:bg-blue-700 rounded-md font-bold transition-colors text-center text-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            {isOnMeetingsPage && (
              <Button 
                variant="default"
                size="lg"
                className="flex items-center justify-center gap-1 mx-4 my-2 bg-blue-600 text-white hover:bg-blue-700"
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
                <KeyRound className="h-5 w-5" />
                Symbl Credentials
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dark overlay when mobile menu is open */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/75 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
