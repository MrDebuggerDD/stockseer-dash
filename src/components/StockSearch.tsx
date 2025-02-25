
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
}

interface StockSuggestion {
  symbol: string;
  company_name: string;
}

const StockSearch = ({ onSearch }: StockSearchProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke('stock-search', {
            body: { query: query }
          });

          if (error) throw error;
          setSuggestions(data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          toast.error('Failed to fetch suggestions');
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.toUpperCase());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (selectedSymbol: string) => {
    setQuery(selectedSymbol);
    onSearch(selectedSymbol);
    setShowSuggestions(false);
  };

  return (
    <Card className="glass-card p-4 animate-fade-up relative z-50">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search any stock symbol or company name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input pl-10"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              {suggestions.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer"
                  onClick={() => handleSuggestionClick(stock.symbol)}
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground">{stock.company_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default StockSearch;
