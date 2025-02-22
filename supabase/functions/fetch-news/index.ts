
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
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY')
    const { symbol } = await req.json()

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWS_API_KEY}&pageSize=3&language=en&sortBy=publishedAt`
    )

    const data = await response.json()

    // Transform news data to match our format
    const formattedNews = data.articles.map((article: any) => ({
      title: article.title,
      source: article.source.name,
      sentiment: "neutral", // You could add sentiment analysis here
      time: new Date(article.publishedAt).toRelativeTime()
    }))

    return new Response(JSON.stringify(formattedNews), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in fetch-news function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
