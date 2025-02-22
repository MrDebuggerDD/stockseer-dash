
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HistoricalDataPoint {
  date: string;
  price: number;
}

interface NewsItem {
  title: string;
  sentiment: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, price, historicalData, news } = await req.json();

    // Analyze historical data trends
    const prices = historicalData?.map((d: HistoricalDataPoint) => d.price) || [];
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const trend = price > avgPrice ? "up" : "down";

    // Analyze news sentiment
    const newsSentiment = news?.reduce((acc: number, item: NewsItem) => {
      if (item.sentiment === "positive") return acc + 1;
      if (item.sentiment === "negative") return acc - 1;
      return acc;
    }, 0) || 0;

    // Combine historical and news analysis
    const direction = (trend === "up" && newsSentiment >= 0) || 
                     (trend === "down" && newsSentiment < 0) ? trend : 
                     (Math.random() > 0.5 ? "up" : "down");

    // Calculate confidence based on consistency of signals
    const confidence = 0.5 + (Math.abs(newsSentiment) / (news?.length || 1)) * 0.3;
    
    // Calculate target price
    const volatility = Math.std(prices) / avgPrice;
    const priceChange = price * volatility * (direction === "up" ? 1 : -1);

    const prediction = {
      direction,
      confidence,
      nextTarget: price + priceChange,
      timeframe: "24h"
    };

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in stock-prediction function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
