
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/ChatBot";
import Navigation from "@/components/Navigation";

const Chat = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 text-white">
      <Navigation darkTheme={true} />
      <div className="container py-8 max-w-5xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
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
