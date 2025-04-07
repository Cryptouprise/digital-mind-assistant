
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface ChatLog {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
}

export default function History() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Jarvis Chat History";
    
    async function fetchChatLogs() {
      try {
        // Use type assertion to work around TypeScript issues
        const { data, error } = await supabase
          .from('ai_logs' as any)
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Cast the data to match our ChatLog interface
        setLogs(data as unknown as ChatLog[] || []);
      } catch (err: any) {
        console.error("Error fetching chat logs:", err);
        setError(err.message || "Failed to load chat history");
      } finally {
        setLoading(false);
      }
    }
    
    fetchChatLogs();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-300">Loading chat history...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Jarvis Chat History</h1>
      
      {logs.length === 0 ? (
        <div className="text-center bg-slate-800 p-6 rounded-lg border border-slate-700">
          <p className="text-slate-300">No chat history found. Start a conversation with Jarvis to see your history here.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-200">Date</TableHead>
                <TableHead className="text-slate-200">Prompt</TableHead>
                <TableHead className="text-slate-200">Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-slate-700">
                  <TableCell className="text-slate-300 whitespace-nowrap">
                    {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="max-w-xs truncate">{log.prompt}</div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    <div className="max-w-xs truncate">{log.response}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
