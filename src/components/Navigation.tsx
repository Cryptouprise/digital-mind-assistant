
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BrainCircuit, KeyRound, Menu, X, Home, MessageCircle, Settings, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const isOnMeetingsPage = location.pathname === "/meetings";
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/95 backdrop-blur-sm shadow-lg" : "bg-slate-900"}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Jarvis AI</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLinks />
          
          {isOnMeetingsPage && (
            <SymblCredentialsButton />
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            onClick={toggleMobileMenu}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-16 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 shadow-xl z-50">
            <div className="container mx-auto flex flex-col space-y-4">
              <MobileNavLinks />
              
              {isOnMeetingsPage && (
                <div className="pt-2 border-t border-slate-800">
                  <SymblCredentialsButton isMobile />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

const NavLinks = () => {
  const location = useLocation();
  
  return (
    <>
      <NavLink to="/" label="Dashboard" icon={<Home className="h-4 w-4 mr-1" />} isActive={location.pathname === "/"} />
      <NavLink to="/meetings" label="Meetings" icon={<Video className="h-4 w-4 mr-1" />} isActive={location.pathname === "/meetings"} />
      <NavLink to="/chat" label="Chat" icon={<MessageCircle className="h-4 w-4 mr-1" />} isActive={location.pathname === "/chat"} />
      <NavLink to="/settings" label="Settings" icon={<Settings className="h-4 w-4 mr-1" />} isActive={location.pathname === "/settings"} />
    </>
  );
};

const MobileNavLinks = () => {
  const location = useLocation();
  
  return (
    <>
      <MobileNavLink to="/" label="Dashboard" icon={<Home className="h-5 w-5 mr-2" />} isActive={location.pathname === "/"} />
      <MobileNavLink to="/meetings" label="Meetings" icon={<Video className="h-5 w-5 mr-2" />} isActive={location.pathname === "/meetings"} />
      <MobileNavLink to="/chat" label="Chat" icon={<MessageCircle className="h-5 w-5 mr-2" />} isActive={location.pathname === "/chat"} />
      <MobileNavLink to="/settings" label="Settings" icon={<Settings className="h-5 w-5 mr-2" />} isActive={location.pathname === "/settings"} />
    </>
  );
};

const NavLink = ({ to, label, icon, isActive }: { to: string, label: string, icon: React.ReactNode, isActive: boolean }) => (
  <Link 
    to={to}
    className={`flex items-center text-sm font-medium transition-colors px-2 py-1 rounded-md ${
      isActive 
        ? "text-white bg-blue-600/20" 
        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
    }`}
  >
    {icon}
    {label}
  </Link>
);

const MobileNavLink = ({ to, label, icon, isActive }: { to: string, label: string, icon: React.ReactNode, isActive: boolean }) => (
  <Link 
    to={to}
    className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
      isActive 
        ? "bg-blue-600/20 text-white" 
        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
    }`}
  >
    {icon}
    {label}
  </Link>
);

const SymblCredentialsButton = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { toast } = useToast();
  
  const handleClick = () => {
    const event = new CustomEvent('open-symbl-credentials');
    window.dispatchEvent(event);
    
    toast({
      title: "Opening credentials form",
      description: "Enter your Symbl API credentials"
    });
  };
  
  if (isMobile) {
    return (
      <Button 
        variant="default"
        size="lg"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        <KeyRound className="h-5 w-5" />
        Symbl Credentials
      </Button>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-1 bg-blue-700/80 text-white hover:bg-blue-800 border-blue-500"
    >
      <KeyRound className="h-4 w-4" />
      Symbl Credentials
    </Button>
  );
};

export default Navigation;
