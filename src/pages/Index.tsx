
import React from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "@/components/ChatBot";
import Navigation from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">
      <Navigation darkTheme={true} />

      {/* Hero Section */}
      <main className="p-6 max-w-5xl mx-auto">
        <section className="text-center mb-10 pt-10">
          <h2 className="text-4xl font-extrabold mb-2">Welcome to Jarvis</h2>
          <p className="text-lg text-gray-300">
            Your AI-powered growth partner, strategist, and digital assistant.
          </p>
        </section>

        <section>
          <ChatBot />
        </section>
      </main>
    </div>
  );
};

export default Index;
