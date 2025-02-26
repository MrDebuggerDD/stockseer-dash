
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

    // Get company info with more details
    const infoResponse = await fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,summaryProfile,assetProfile`)
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

    // Enhanced logo handling
    const companyName = companyInfo?.price?.longName || ''
    let logoUrl = null

    try {
      // Check if we already have the stock info
      const { data: existingStock } = await supabase
        .from('stocks')
        .select('logo_url')
        .eq('symbol', symbol)
        .maybeSingle()

      if (!existingStock?.logo_url) {
        // Company-specific logo handling
        const specialCases: Record<string, string> = {
          'NVDA': 'https://logo.clearbit.com/nvidia.com',
          'AAPL': 'https://logo.clearbit.com/apple.com',
          'MSFT': 'https://logo.clearbit.com/microsoft.com',
          'GOOGL': 'https://logo.clearbit.com/google.com',
          'META': 'https://logo.clearbit.com/meta.com',
          'AMZN': 'https://logo.clearbit.com/amazon.com',
          'TSLA': 'https://logo.clearbit.com/tesla.com',
          'NFLX': 'https://logo.clearbit.com/netflix.com',
          'IBM': 'https://logo.clearbit.com/ibm.com',
          'INTC': 'https://logo.clearbit.com/intel.com',
          'AMD': 'https://logo.clearbit.com/amd.com',
          'ADBE': 'https://logo.clearbit.com/adobe.com',
          'CSCO': 'https://logo.clearbit.com/cisco.com',
          'CRM': 'https://logo.clearbit.com/salesforce.com',
          'ORCL': 'https://logo.clearbit.com/oracle.com',
          'QCOM': 'https://logo.clearbit.com/qualcomm.com',
          'TCS': 'https://logo.clearbit.com/tcs.com',
          'INFY': 'https://logo.clearbit.com/infosys.com',
          'WIT': 'https://logo.clearbit.com/wipro.com',
          'HCLTECH.NS': 'https://logo.clearbit.com/hcltech.com',
          'TECHM.NS': 'https://logo.clearbit.com/techmahindra.com',
        }

        // Try special cases first
        if (specialCases[symbol]) {
          const response = await fetch(specialCases[symbol])
          if (response.ok) {
            logoUrl = specialCases[symbol]
          }
        }

        // If no special case or it failed, try Yahoo Finance logo
        if (!logoUrl) {
          const yahooLogoUrl = `https://s.yimg.com/aq/autoc/td/data/logos/${symbol}.png`
          const yahooResponse = await fetch(yahooLogoUrl)
          if (yahooResponse.ok) {
            logoUrl = yahooLogoUrl
          }
        }

        // If Yahoo fails, try to get website from company info and use Clearbit
        if (!logoUrl) {
          const website = companyInfo?.assetProfile?.website || companyInfo?.summaryProfile?.website
          if (website) {
            const domain = new URL(website).hostname.replace('www.', '')
            const clearbitUrl = `https://logo.clearbit.com/${domain}`
            const response = await fetch(clearbitUrl)
            if (response.ok) {
              logoUrl = clearbitUrl
            }
          }
        }

        // If all else fails, use a default stock market image
        if (!logoUrl) {
          logoUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop"
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
      logoUrl = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&h=100&fit=crop"
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
