
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StockChart from "@/components/StockChart";
import StockPrice from "@/components/StockPrice";
import NewsCard from "@/components/NewsCard";
import StockSearch from "@/components/StockSearch";
import PredictionCard from "@/components/PredictionCard";
import { toast } from "sonner";

// Mock chart data (replace with real API)
const mockChartData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 0, i + 1).toLocaleDateString(),
  price: 150 + Math.random() * 50,
}));

const Index = () => {
  const [selectedStock, setSelectedStock] = useState({
    symbol: "AAPL",
    price: 191.56,
    change: 2.34,
    changePercent: 1.23,
  });

  // Fetch news data
  const { data: newsData, isLoading: isLoadingNews } = useQuery({
    queryKey: ['news', selectedStock.symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { symbol: selectedStock.symbol }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStock.symbol
  });

  // Fetch prediction data
  const { data: predictionData, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ['prediction', selectedStock.symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stock-prediction', {
        body: { 
          symbol: selectedStock.symbol,
          price: selectedStock.price
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStock.symbol
  });

  // Set up WebSocket connection for real-time price updates
  useEffect(() => {
    if (!selectedStock.symbol) return;

    const channel = supabase
      .channel('stock-updates')
      .on('broadcast', { event: 'price-update' }, (payload) => {
        if (payload.symbol === selectedStock.symbol) {
          setSelectedStock(prev => ({
            ...prev,
            price: payload.price,
            change: payload.change,
            changePercent: payload.changePercent
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStock.symbol]);

  const handleSearch = async (symbol: string) => {
    try {
      // Simulate updating the stock data (replace with real API)
      setSelectedStock({
        symbol,
        price: 150 + Math.random() * 100,
        change: -1.5 + Math.random() * 3,
        changePercent: -1 + Math.random() * 2,
      });
      
      toast.success(`Successfully loaded data for ${symbol}`);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to fetch stock data');
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <header className="mb-8">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold">Market Overview</h1>
          <p className="text-muted-foreground">Real-time market insights and predictions</p>
        </div>
      </header>

      <StockSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StockChart data={mockChartData} />
        </div>
        <div className="space-y-6">
          <StockPrice {...selectedStock} />
          {predictionData && <PredictionCard predictionData={predictionData} />}
          {newsData && <NewsCard news={newsData} />}
        </div>
      </div>
    </div>
  );
};

export default Index;
