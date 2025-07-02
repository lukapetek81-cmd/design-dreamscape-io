import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
  category?: string;
}

const commodityKeywords = [
  'commodity', 'commodities', 'trading', 'futures', 'market', 'price',
  'gold', 'silver', 'oil', 'crude', 'natural gas', 'copper', 'platinum',
  'wheat', 'corn', 'soybeans', 'cattle', 'coffee', 'sugar', 'cotton',
  'agriculture', 'metals', 'energy', 'livestock', 'grains'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'all' } = await req.json();
    
    // Get News API key from Supabase secrets
    const newsApiKey = Deno.env.get('NEWS_API_KEY');
    
    if (!newsApiKey) {
      console.error('NEWS_API_KEY not found in environment variables');
      // Return fallback news data
      const fallbackNews: NewsItem[] = [
        {
          id: '1',
          title: 'Global Oil Prices Rise Amid Supply Concerns',
          description: 'Crude oil prices increased by 2% as supply chain disruptions continue to affect global markets.',
          url: '#',
          source: 'Market News',
          publishedAt: new Date().toISOString(),
          category: 'energy'
        },
        {
          id: '2',
          title: 'Gold Futures Hit Monthly High',
          description: 'Gold prices reached their highest point this month as investors seek safe-haven assets.',
          url: '#',
          source: 'Financial Times',
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          category: 'metals'
        },
        {
          id: '3',
          title: 'Wheat Production Forecasts Revised Upward',
          description: 'Agricultural experts predict better than expected wheat yields this season.',
          url: '#',
          source: 'AgriNews',
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          category: 'grains'
        }
      ];
      
      return new Response(
        JSON.stringify({ articles: fallbackNews, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build search query
    const query = commodityKeywords.join(' OR ');
    const searchParams = new URLSearchParams({
      q: query,
      sortBy: 'publishedAt',
      pageSize: '50',
      language: 'en',
      apiKey: newsApiKey
    });

    const newsResponse = await fetch(`https://newsapi.org/v2/everything?${searchParams}`);
    
    if (!newsResponse.ok) {
      throw new Error(`News API error: ${newsResponse.status}`);
    }

    const newsData = await newsResponse.json();
    
    // Filter and format articles
    const articles: NewsItem[] = newsData.articles
      .filter((article: any) => {
        // Filter out articles without essential data
        return article.title && 
               article.description && 
               article.url &&
               article.source?.name &&
               article.publishedAt;
      })
      .map((article: any) => {
        // Determine category based on content
        const content = (article.title + ' ' + article.description).toLowerCase();
        let category = 'general';
        
        if (content.includes('oil') || content.includes('crude') || content.includes('gas') || content.includes('energy')) {
          category = 'energy';
        } else if (content.includes('gold') || content.includes('silver') || content.includes('copper') || content.includes('metal')) {
          category = 'metals';
        } else if (content.includes('wheat') || content.includes('corn') || content.includes('grain') || content.includes('agriculture')) {
          category = 'grains';
        } else if (content.includes('cattle') || content.includes('livestock') || content.includes('beef')) {
          category = 'livestock';
        } else if (content.includes('coffee') || content.includes('sugar') || content.includes('cotton') || content.includes('cocoa')) {
          category = 'softs';
        }

        return {
          id: article.url, // Use URL as unique identifier
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage,
          category
        };
      })
      .slice(0, 30); // Limit to 30 articles

    return new Response(
      JSON.stringify({ articles, source: 'api' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Return fallback data on error
    const fallbackNews: NewsItem[] = [
      {
        id: '1',
        title: 'Market Update: Commodity Prices Mixed',
        description: 'Various commodity markets showed mixed performance today with energy leading gains.',
        url: '#',
        source: 'Market Watch',
        publishedAt: new Date().toISOString(),
        category: 'general'
      }
    ];
    
    return new Response(
      JSON.stringify({ articles: fallbackNews, source: 'fallback', error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});