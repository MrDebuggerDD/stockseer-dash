
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, price } = await req.json()

    // Simplified prediction logic (replace with your ML model API call)
    const randomConfidence = 0.6 + Math.random() * 0.3
    const direction = Math.random() > 0.5 ? "up" : "down"
    const priceChange = price * (0.02 + Math.random() * 0.08) * (direction === "up" ? 1 : -1)

    const prediction = {
      direction,
      confidence: randomConfidence,
      nextTarget: price + priceChange,
      timeframe: "24h"
    }

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in stock-prediction function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
