
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch stock data from Yahoo Finance
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`)
    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.description)
    }

    // Get company info
    const infoResponse = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryProfile`)
    const infoData = await infoResponse.json()
    const companyInfo = infoData?.quoteSummary?.result?.[0]

    // Format historical data
    const timestamps = data.chart.result[0].timestamp
    const quotes = data.chart.result[0].indicators.quote[0]
    const historicalData = timestamps.map((time: number, index: number) => ({
      date: new Date(time * 1000).toISOString(),
      price: quotes.close[index] || quotes.open[index],
    })).filter((item: any) => item.price !== null)

    // Get current price and changes
    const currentPrice = data.chart.result[0].meta.regularMarketPrice
    const previousClose = data.chart.result[0].meta.previousClose
    const priceChange = currentPrice - previousClose
    const percentChange = (priceChange / previousClose) * 100

    // Try to get or create company logo
    const companyName = companyInfo?.price?.longName || ''
    let logoUrl = null

    try {
      // Check if we already have the stock info
      const { data: existingStock } = await supabase
        .from('stocks')
        .select('logo_url')
        .eq('symbol', symbol)
        .maybeSingle()

      if (!existingStock) {
        // If not found, try to get logo from Clearbit API
        const clearbitUrl = `https://logo.clearbit.com/${companyInfo?.summaryProfile?.website}?size=100`
        const logoResponse = await fetch(clearbitUrl)
        
        if (logoResponse.ok) {
          logoUrl = clearbitUrl
        } else {
          // Fallback to default placeholder
          logoUrl = `https://ui-avatars.com/api/?name=${symbol}&background=random`
        }

        // Save to database
        await supabase
          .from('stocks')
          .upsert({
            symbol,
            company_name: companyName,
            logo_url: logoUrl
          })
      } else {
        logoUrl = existingStock.logo_url
      }
    } catch (error) {
      console.error('Error handling logo:', error)
    }

    return new Response(
      JSON.stringify({
        historicalData,
        currentPrice,
        priceChange,
        percentChange,
        companyName,
        logoUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
