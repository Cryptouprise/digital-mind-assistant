
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  text: string;
  source: string;
  timestamp: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setLoading(true);
    try {
      // Mock API call - replace with real implementation when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: SearchResult[] = [
        { 
          id: '1', 
          text: 'Layla mentioned that she needs pricing for enterprise tier.', 
          source: 'Meeting: Q2 Review', 
          timestamp: '2025-01-15' 
        },
        { 
          id: '2', 
          text: 'Layla requested a demo of the new features next Tuesday.', 
          source: 'Email Exchange', 
          timestamp: '2025-01-18' 
        },
        { 
          id: '3', 
          text: 'The team discussed integration options with Layla during the technical call.', 
          source: 'Technical Assessment', 
          timestamp: '2025-01-20' 
        },
      ];
      
      setResults(mockResults);
      toast.success("Search completed");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to perform search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Jarvis Memory Search</h1>
      
      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What happened in Layla's meeting?"
          className="flex-grow bg-slate-800 border-slate-700 text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4 mr-2" />}
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id} className="bg-slate-800 border-slate-700 text-white">
              <CardContent className="p-4">
                <p className="mb-2">{result.text}</p>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{result.source}</span>
                  <span>{result.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {query && !loading && results.length === 0 && (
        <div className="text-center p-8 text-slate-400">
          <p>No matching results found</p>
        </div>
      )}
    </div>
  );
}
