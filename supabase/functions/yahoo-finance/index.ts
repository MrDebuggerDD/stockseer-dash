
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    // Fetch quote data
    const quoteResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
    const quoteData = await quoteResponse.json();
    
    if (quoteData.error) {
      throw new Error(quoteData.error.description);
    }

    // Fetch company info
    const infoResponse = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryProfile`);
    const infoData = await infoResponse.json();

    const result = quoteData.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const prices = quotes.close;

    // Get current price and market changes
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const priceChange = currentPrice - previousPrice;
    const percentChange = (priceChange / previousPrice) * 100;

    // Get company name from info data
    const companyName = infoData.quoteSummary.result[0].price.longName;

    // Format historical data
    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: prices[index]
    })).filter((item: any) => item.price !== null);

    return {
      currentPrice,
      priceChange,
      percentChange,
      historicalData,
      companyName
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
    console.log('Fetching data for symbol:', symbol);

    const data = await fetchYahooFinanceData(symbol);
    console.log('Successfully fetched data:', data);

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
