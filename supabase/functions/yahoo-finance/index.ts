
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    // Use Yahoo Finance API v6 for more reliable data
    const response = await fetch(`https://query2.finance.yahoo.com/v6/finance/quote?symbols=${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const data = await response.json();
    if (!data.quoteResponse?.result?.[0]) {
      throw new Error('No data found for symbol');
    }

    const quote = data.quoteResponse.result[0];
    
    // Get historical data
    const historicalResponse = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
    if (!historicalResponse.ok) throw new Error('Failed to fetch historical data');
    
    const historicalData = await historicalResponse.json();
    const timestamps = historicalData.chart.result[0].timestamp;
    const prices = historicalData.chart.result[0].indicators.quote[0].close;

    // Format historical data
    const formattedHistoricalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: prices[index] || null
    })).filter((item: any) => item.price !== null);

    return {
      currentPrice: quote.regularMarketPrice,
      priceChange: quote.regularMarketChange,
      percentChange: quote.regularMarketChangePercent,
      companyName: quote.longName || quote.shortName,
      historicalData: formattedHistoricalData
    };
  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json();
    if (!symbol) throw new Error('Symbol is required');
    
    console.log('Fetching data for symbol:', symbol);
    const data = await fetchYahooFinanceData(symbol);
    console.log('Successfully fetched data for', symbol);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in yahoo-finance function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
