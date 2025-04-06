
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/ChatBot";
import Navigation from "@/components/Navigation";

const Chat = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="container py-8 max-w-5xl mx-auto flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Chat with Jarvis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatBot />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
