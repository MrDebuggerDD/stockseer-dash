
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

// Calculate standard deviation
function calculateStd(values: number[]): number {
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, price, historicalData, news } = await req.json();

    console.log('Received data for prediction:', { symbol, price, historicalDataLength: historicalData?.length });

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
                     "neutral";

    // Calculate confidence based on consistency of signals
    const confidence = 0.5 + (Math.abs(newsSentiment) / (news?.length || 1)) * 0.3;
    
    // Calculate target price
    const volatility = calculateStd(prices) / avgPrice;
    const priceChange = price * volatility * (direction === "up" ? 1 : direction === "down" ? -1 : 0.5);
    const nextTarget = price + priceChange;

    const prediction = {
      direction: direction as "up" | "down" | "neutral",
      confidence,
      nextTarget,
      timeframe: "24h"
    };

    console.log('Generated prediction:', prediction);

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
