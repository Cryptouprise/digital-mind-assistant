
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/ChatBot";

const Chat = () => {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Chat with Jarvis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChatBot />
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
