
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithProxy(url: string) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    console.log('Starting to fetch data for:', symbol);

    // Fetch quote data
    const quoteData = await fetchWithProxy(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`
    );

    if (!quoteData.chart?.result?.[0]) {
      throw new Error('Invalid data received from Yahoo Finance');
    }

    const result = quoteData.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const prices = quotes.close;

    // Calculate current price and changes
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const priceChange = currentPrice - previousClose;
    const percentChange = (priceChange / previousClose) * 100;

    // Format historical data
    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: prices[index]
    })).filter((item: any) => item.price !== null);

    // Fetch company info
    const companyData = await fetchWithProxy(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`
    );

    const companyName = companyData.quoteSummary?.result?.[0]?.price?.longName || symbol;

    const response = {
      currentPrice,
      priceChange,
      percentChange,
      companyName,
      historicalData
    };

    console.log('Successfully processed data for:', symbol);
    return response;

  } catch (error) {
    console.error('Error in fetchYahooFinanceData:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const data = await fetchYahooFinanceData(symbol);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch data',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
