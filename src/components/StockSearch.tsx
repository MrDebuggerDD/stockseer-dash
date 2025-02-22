
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
}

const StockSearch = ({ onSearch }: StockSearchProps) => {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.toUpperCase());
    }
  };

  return (
    <Card className="glass-card p-4 animate-fade-up">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="search-input pl-10"
          />
        </div>
      </form>
    </Card>
  );
};

export default StockSearch;
