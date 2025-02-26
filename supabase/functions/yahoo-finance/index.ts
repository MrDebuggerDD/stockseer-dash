
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
        // Try multiple approaches to get the logo
        const website = companyInfo?.assetProfile?.website || companyInfo?.summaryProfile?.website
        if (website) {
          // Try main domain first
          const domain = new URL(website).hostname.replace('www.', '')
          const clearbitUrl = `https://logo.clearbit.com/${domain}?size=100`
          const logoResponse = await fetch(clearbitUrl)
          
          if (logoResponse.ok) {
            logoUrl = clearbitUrl
          } else {
            // Try alternative sources
            // Try Yahoo Finance logo (if available)
            try {
              const yahooLogoUrl = `https://s.yimg.com/aq/autoc/td/data/logos/${symbol}.png`
              const yahooResponse = await fetch(yahooLogoUrl)
              if (yahooResponse.ok) {
                logoUrl = yahooLogoUrl
              }
            } catch (error) {
              console.error('Error fetching Yahoo logo:', error)
            }

            // If still no logo, try company name-based approach with Clearbit
            if (!logoUrl) {
              const companyDomain = companyName.toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .replace(/corporation|corp|inc|ltd|limited/g, '')
              const altClearbitUrl = `https://logo.clearbit.com/${companyDomain}.com?size=100`
              const altResponse = await fetch(altClearbitUrl)
              if (altResponse.ok) {
                logoUrl = altClearbitUrl
              } else {
                // Final fallback to a stock market related image
                logoUrl = "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=100&h=100&fit=crop"
              }
            }
          }
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
      // Use a default stock market building image as final fallback
      logoUrl = "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=100&h=100&fit=crop"
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
