
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StockChart from "@/components/StockChart";
import StockPrice from "@/components/StockPrice";
import NewsCard from "@/components/NewsCard";
import StockSearch from "@/components/StockSearch";
import PredictionCard from "@/components/PredictionCard";
import { toast } from "sonner";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  logoUrl?: string;
  companyName?: string;
}

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<StockData>({
    symbol: "AAPL",
    price: 0,
    change: 0,
    changePercent: 0,
  });

  const { data: stockDetails } = useQuery({
    queryKey: ['stockDetails', selectedStock.symbol],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('symbol', selectedStock.symbol)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStock.symbol
  });

  // Fetch real-time and historical data from Yahoo Finance
  const { data: yahooData, isLoading: isLoadingYahoo } = useQuery({
    queryKey: ['yahooData', selectedStock.symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('yahoo-finance', {
        body: { symbol: selectedStock.symbol }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStock.symbol,
    refetchInterval: 60000 // Refetch every minute
  });

  // Update stock data when Yahoo data changes
  useEffect(() => {
    if (yahooData) {
      setSelectedStock(prev => ({
        ...prev,
        price: yahooData.currentPrice,
        change: yahooData.priceChange,
        changePercent: yahooData.percentChange
      }));
    }
  }, [yahooData]);

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

  const { data: predictionData, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ['prediction', selectedStock.symbol],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stock-prediction', {
        body: { 
          symbol: selectedStock.symbol,
          price: selectedStock.price,
          historicalData: yahooData?.historicalData,
          news: newsData
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStock.symbol && !!yahooData?.historicalData && !!newsData
  });

  const handleSearch = async (symbol: string) => {
    try {
      const { data: stockInfo, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) throw error;

      setSelectedStock(prev => ({
        ...prev,
        symbol,
        logoUrl: stockInfo.logo_url,
        companyName: stockInfo.company_name
      }));
      
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
          <StockChart 
            data={yahooData?.historicalData || []} 
            isLoading={isLoadingYahoo}
          />
        </div>
        <div className="space-y-6">
          <StockPrice 
            {...selectedStock} 
            logoUrl={stockDetails?.logo_url}
            companyName={stockDetails?.company_name}
          />
          {predictionData && <PredictionCard predictionData={predictionData} />}
          {newsData && <NewsCard news={newsData} />}
        </div>
      </div>
    </div>
  );
};

export default Index;
