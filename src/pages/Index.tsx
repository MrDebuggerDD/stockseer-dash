
import { useState } from "react";
import StockChart from "@/components/StockChart";
import StockPrice from "@/components/StockPrice";
import NewsCard from "@/components/NewsCard";

// Mock data for demonstration
const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toLocaleDateString(),
  price: 150 + Math.random() * 50,
}));

const mockNews = [
  {
    title: "Market Rally Continues as Tech Stocks Surge",
    source: "Financial Times",
    sentiment: "positive" as const,
    time: "2h ago",
  },
  {
    title: "Global Markets Face Uncertainty Amid Economic Data",
    source: "Reuters",
    sentiment: "neutral" as const,
    time: "4h ago",
  },
  {
    title: "Inflation Concerns Weigh on Market Sentiment",
    source: "Bloomberg",
    sentiment: "negative" as const,
    time: "5h ago",
  },
];

const Index = () => {
  const [selectedStock] = useState({
    symbol: "AAPL",
    price: 191.56,
    change: 2.34,
    changePercent: 1.23,
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="mb-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold">Market Overview</h1>
          <p className="text-muted-foreground">Real-time market insights and predictions</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StockChart data={mockChartData} />
        </div>
        <div className="space-y-6">
          <StockPrice {...selectedStock} />
          <NewsCard news={mockNews} />
        </div>
      </div>
    </div>
  );
};

export default Index;
