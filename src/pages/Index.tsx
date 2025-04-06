
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, MessageSquareText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Digital Mind Assistant</span>
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

      {/* Hero Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="inline-flex mb-2">
                  AI Assistant
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Your Digital Mind Assistant
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Experience the power of AI with Jarvis, your personal digital assistant. 
                  Ask questions, get insights, and hear responses in a natural voice.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/chat">
                  <Button size="lg">
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    Start Chatting
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md rounded-xl border">
                <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                  <div className="space-y-4 text-center">
                    <BrainCircuit className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">Jarvis Assistant</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your AI-powered assistant with voice capabilities. 
                        Click "Start Chatting" to begin your conversation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-muted p-3">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Natural Conversations</h3>
              <p className="text-muted-foreground">
                Chat with Jarvis in natural language and receive helpful, human-like responses.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Voice Responses</h3>
              <p className="text-muted-foreground">
                Enable voice responses to hear Jarvis speak to you in a natural-sounding voice.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-muted p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold">Integration Ready</h3>
              <p className="text-muted-foreground">
                Connects with Go High Level and other platforms to automate your workflows.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
