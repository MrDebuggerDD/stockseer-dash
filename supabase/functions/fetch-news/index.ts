
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
    const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY')
    const { symbol } = await req.json()

    console.log('Fetching news for symbol:', symbol)

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWS_API_KEY}&pageSize=3&language=en&sortBy=publishedAt`
    )

    const data = await response.json()
    console.log('Received news data:', data)

    if (data.status === 'error') {
      throw new Error(data.message)
    }

    // Transform news data to match our format
    const formattedNews = data.articles.map((article: any) => {
      // Format the time as a relative string
      const date = new Date(article.publishedAt)
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor(diff / (1000 * 60))
      
      let timeString
      if (hours > 24) {
        timeString = `${Math.floor(hours / 24)}d ago`
      } else if (hours > 0) {
        timeString = `${hours}h ago`
      } else {
        timeString = `${minutes}m ago`
      }

      return {
        title: article.title,
        source: article.source.name,
        sentiment: "neutral",
        time: timeString
      }
    })

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
