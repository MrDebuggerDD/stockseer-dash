
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    console.log('Searching for stocks with query:', query)

    // Use Yahoo Finance API through our server to avoid CORS issues
    const response = await fetch(
      `https://query2.finance.yahoo.com/v6/finance/autocomplete?query=${encodeURIComponent(query)}&lang=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        }
      }
    )
    
    const data = await response.json()
    console.log('Received search results:', data)

    const suggestions = data.ResultSet?.Result?.map((item: any) => ({
      symbol: item.symbol,
      company_name: item.name
    })) || []

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in stock search:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
