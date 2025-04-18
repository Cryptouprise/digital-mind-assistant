
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Meetings from "./pages/Meetings";
import Jarvis from "./pages/Jarvis";
import History from "./pages/History";
import Leads from "./pages/Leads";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import CommandCenter from "./pages/CommandCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-900 text-white">
          <Navigation />
          <main className="flex-1 flex flex-col pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/jarvis" element={<Jarvis />} />
              <Route path="/history" element={<History />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/command-center" element={<CommandCenter />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
