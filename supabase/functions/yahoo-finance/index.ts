
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    console.log(`Starting to fetch data for ${symbol}`);
    
    // First try the quote endpoint
    const quoteUrl = `https://query2.finance.yahoo.com/v6/finance/quote?symbols=${symbol}`;
    console.log('Fetching from:', quoteUrl);
    
    const quoteResponse = await fetch(quoteUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Some APIs require a user agent
      }
    });
    
    if (!quoteResponse.ok) {
      console.error('Quote response not OK:', await quoteResponse.text());
      throw new Error('Failed to fetch quote data');
    }
    
    const quoteData = await quoteResponse.json();
    console.log('Quote data received:', quoteData);
    
    if (!quoteData.quoteResponse?.result?.[0]) {
      throw new Error('No quote data found for symbol');
    }

    const quote = quoteData.quoteResponse.result[0];

    // Then fetch historical data
    const chartUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`;
    console.log('Fetching chart from:', chartUrl);
    
    const chartResponse = await fetch(chartUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!chartResponse.ok) {
      console.error('Chart response not OK:', await chartResponse.text());
      throw new Error('Failed to fetch historical data');
    }

    const chartData = await chartResponse.json();
    console.log('Chart data received:', chartData);

    if (!chartData.chart?.result?.[0]) {
      throw new Error('No historical data found');
    }

    const result = chartData.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote[0];
    const prices = quotes.close || [];

    // Format historical data
    const historicalData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      price: prices[index] || null
    })).filter((item: any) => item.price !== null);

    const response = {
      currentPrice: quote.regularMarketPrice,
      priceChange: quote.regularMarketChange,
      percentChange: quote.regularMarketChangePercent,
      companyName: quote.longName || quote.shortName,
      historicalData: historicalData
    };

    console.log('Successfully processed data:', response);
    return response;

  } catch (error) {
    console.error('Detailed error in fetchYahooFinanceData:', {
      error,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    console.log('Request received for symbol:', symbol);
    
    const data = await fetchYahooFinanceData(symbol);
    
    console.log('Sending successful response for:', symbol);

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      },
    );

  } catch (error) {
    console.error('Error in edge function:', {
      error,
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
      },
    );
  }
});
