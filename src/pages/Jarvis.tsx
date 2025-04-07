
import { useEffect } from "react";
import JarvisChat from "@/components/JarvisChat";

export default function Jarvis() {
  useEffect(() => {
    document.title = "Jarvis AI Assistant";
  }, []);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Jarvis AI Assistant</h1>
        <p className="text-slate-300">Your intelligent sales assistant. Ask questions about meetings, contacts, or how to automate your workflow.</p>
      </div>
      
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg h-[calc(100%-120px)]">
        <JarvisChat />
      </div>
    </div>
  );
}
