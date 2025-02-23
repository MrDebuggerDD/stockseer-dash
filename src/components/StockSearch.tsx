
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
}

interface StockSuggestion {
  symbol: string;
  company_name: string;
  logo_url: string | null;
}

const StockSearch = ({ onSearch }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (symbol.trim().length > 0) {
        try {
          const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=5&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`);
          const data = await response.json();
          
          if (data.quotes) {
            const suggestions = data.quotes.map((quote: any) => ({
              symbol: quote.symbol,
              company_name: quote.longname || quote.shortname,
              logo_url: null
            }));
            setSuggestions(suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [symbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.toUpperCase());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (selectedSymbol: string) => {
    setSymbol(selectedSymbol);
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
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="search-input pl-10"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
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
        </div>
      </form>
    </Card>
  );
};

export default StockSearch;
