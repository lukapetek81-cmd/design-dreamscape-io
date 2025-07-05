import { NewsItem } from './commodityApi';

// Enhanced news source interfaces
interface NewsSourceConfig {
  name: string;
  priority: number;
  maxArticles: number;
  enabled: boolean;
}

// Enhanced news item with sentiment and category
export interface EnhancedNewsItem extends NewsItem {
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: 'market_analysis' | 'regulatory' | 'supply_demand' | 'economic' | 'general';
  relevanceScore?: number;
  tags?: string[];
  author?: string;
}

const NEWS_SOURCES: Record<string, NewsSourceConfig> = {
  marketaux: { name: 'Marketaux', priority: 1, maxArticles: 8, enabled: true },
  fmp: { name: 'FMP', priority: 2, maxArticles: 7, enabled: true }
};

// Utility functions first
const getCommoditySymbols = (commodityName: string): string => {
  const symbolMap: Record<string, string> = {
    'Gold Futures': 'GOLD,GLD,IAU',
    'Silver Futures': 'SILVER,SLV',
    'Copper': 'COPPER,FCX',
    'Crude Oil': 'OIL,USO,UCO',
    'Natural Gas': 'NATGAS,UNG',
    'Corn Futures': 'CORN',
    'Wheat Futures': 'WHEAT',
    'Soybean Futures': 'SOYB'
  };
  return symbolMap[commodityName] || commodityName.replace(/\s+/g, '').toUpperCase();
};

const buildEnhancedNewsQuery = (commodityName: string): string => {
  return buildNewsQuery(commodityName);
};

const getCommodityTicker = (commodityName: string): string => {
  const tickerMap: Record<string, string> = {
    'Gold Futures': 'GLD',
    'Silver Futures': 'SLV', 
    'Crude Oil': 'USO',
    'Natural Gas': 'UNG'
  };
  return tickerMap[commodityName] || 'SPY'; // fallback
};

// Enhanced analysis functions
const analyzeSentiment = (title: string, content: string): 'positive' | 'negative' | 'neutral' => {
  const text = `${title} ${content}`.toLowerCase();
  
  const positiveWords = ['rise', 'rising', 'increase', 'bull', 'bullish', 'up', 'gain', 'gains', 'surge', 'soar'];
  const negativeWords = ['fall', 'falling', 'decline', 'bear', 'bearish', 'down', 'loss', 'losses', 'plunge', 'drop'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore + 1) return 'positive';
  if (negativeScore > positiveScore + 1) return 'negative';
  return 'neutral';
};

const categorizeNews = (title: string, content: string, commodityName: string): 'market_analysis' | 'regulatory' | 'supply_demand' | 'economic' | 'general' => {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('regulation') || text.includes('policy') || text.includes('government')) {
    return 'regulatory';
  }
  if (text.includes('supply') || text.includes('demand') || text.includes('production')) {
    return 'supply_demand';
  }
  if (text.includes('analysis') || text.includes('forecast') || text.includes('outlook')) {
    return 'market_analysis';
  }
  if (text.includes('economy') || text.includes('gdp') || text.includes('inflation')) {
    return 'economic';
  }
  return 'general';
};

const extractTags = (title: string, content: string, commodityName: string): string[] => {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];
  
  if (text.includes('bullish')) tags.push('bullish');
  if (text.includes('bearish')) tags.push('bearish');
  if (text.includes('breaking')) tags.push('breaking');
  if (text.includes('volatility')) tags.push('volatility');
  
  return tags;
};

const calculateEnhancedRelevanceScore = (article: any, commodityName: string): number => {
  let score = 0;
  const title = (article.title || '').toLowerCase();
  const content = (article.description || article.text || '').toLowerCase();
  const commodity = commodityName.toLowerCase();
  
  if (title.includes(commodity)) score += 20;
  if (content.includes(commodity)) score += 15;
  
  // Time relevance
  const publishedTime = new Date(article.published_at || article.publishedAt || Date.now()).getTime();
  const hoursAgo = (Date.now() - publishedTime) / (1000 * 60 * 60);
  
  if (hoursAgo <= 1) score += 10;
  else if (hoursAgo <= 24) score += 5;
  
  return score;
};

// New: Marketaux API integration (financial news aggregator)
export const fetchNewsFromMarketaux = async (commodityName: string): Promise<EnhancedNewsItem[]> => {
  const apiKey = localStorage.getItem('marketauxApiKey') || 'demo';
  
  try {
    const symbols = getCommoditySymbols(commodityName);
    const query = buildEnhancedNewsQuery(commodityName);
    
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=${symbols}&filter_entities=true&language=en&api_token=${apiKey}&limit=5`
    );
    
    if (!response.ok) throw new Error(`Marketaux API error: ${response.status}`);
    
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data.map((article: any, index: number) => ({
      id: `marketaux_${commodityName}_${index}_${Date.now()}`,
      title: article.title || `${commodityName} Market Update`,
      description: article.description || article.snippet || `Latest market analysis for ${commodityName}`,
      url: article.url || '#',
      source: article.source || 'Marketaux',
      publishedAt: article.published_at || new Date().toISOString(),
      urlToImage: article.image_url,
      sentiment: analyzeSentiment(article.title, article.description),
      category: categorizeNews(article.title, article.description, commodityName),
      relevanceScore: calculateEnhancedRelevanceScore(article, commodityName),
      tags: extractTags(article.title, article.description, commodityName),
      author: article.author
    }));
  } catch (error) {
    console.warn('Marketaux API failed:', error);
    return [];
  }
};

export const fetchNewsFromFMP = async (commodityName: string): Promise<EnhancedNewsItem[]> => {
  const getFmpApiKey = () => localStorage.getItem('fmpApiKey') || 'demo';
  const apiKey = getFmpApiKey();
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/general_news?page=0&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`FMP API error: ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(article => isRelevantToCommodity(article.title, article.text, commodityName))
      .slice(0, 4)
      .map((article: any, index: number) => ({
        id: `fmp_${commodityName}_${index}_${Date.now()}`,
        title: article.title || `${commodityName} Market Update`,
        description: article.text ? article.text.substring(0, 200) + '...' : `Latest market news about ${commodityName}`,
        url: article.url || '#',
        source: article.site || 'Financial News',
        publishedAt: article.publishedDate || new Date().toISOString(),
        urlToImage: article.image,
        sentiment: analyzeSentiment(article.title, article.text),
        category: categorizeNews(article.title, article.text, commodityName),
        relevanceScore: calculateEnhancedRelevanceScore(article, commodityName),
        tags: extractTags(article.title, article.text, commodityName)
      }));
  } catch (error) {
    console.warn('FMP API failed:', error);
    return [];
  }
};

const buildNewsQuery = (commodityName: string): string => {
  const baseQuery = commodityName.toLowerCase();
  const additionalTerms = {
    'Gold': 'gold price precious metals',
    'Silver': 'silver price precious metals',
    'Copper': 'copper price industrial metals',
    'WTI Crude': 'crude oil WTI petroleum',
    'Brent Crude': 'brent crude oil petroleum',
    'Natural Gas': 'natural gas energy',
    'Corn': 'corn agriculture grain',
    'Wheat': 'wheat agriculture grain',
    'Soybeans': 'soybeans agriculture grain'
  };
  
  return additionalTerms[commodityName as keyof typeof additionalTerms] || `${baseQuery} commodity market`;
};

const isRelevantToCommodity = (title: string, content: string, commodityName: string): boolean => {
  const text = `${title} ${content}`.toLowerCase();
  const commodity = commodityName.toLowerCase();
  
  if (text.includes(commodity)) return true;
  
  const relatedTerms: Record<string, string[]> = {
    'gold': ['precious metal', 'bullion', 'xau'],
    'silver': ['precious metal', 'bullion', 'xag'],
    'copper': ['industrial metal', 'mining'],
    'wti crude': ['oil', 'petroleum', 'crude', 'wti'],
    'brent crude': ['oil', 'petroleum', 'crude', 'brent'],
    'natural gas': ['lng', 'gas price', 'energy'],
    'corn': ['grain', 'agriculture', 'crop'],
    'wheat': ['grain', 'agriculture', 'crop'],
    'soybeans': ['grain', 'agriculture', 'crop', 'soy']
  };
  
  const terms = relatedTerms[commodity] || [];
  return terms.some(term => text.includes(term)) || 
         text.includes('commodity') || 
         text.includes('market') || 
         text.includes('trading');
};

export const removeDuplicateNews = (news: NewsItem[]): NewsItem[] => {
  const seen = new Set<string>();
  return news.filter(item => {
    const key = item.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const sortNewsByRelevance = (news: NewsItem[], commodityName: string): NewsItem[] => {
  return news.sort((a, b) => {
    const aRelevance = calculateRelevanceScore(a, commodityName);
    const bRelevance = calculateRelevanceScore(b, commodityName);
    
    if (aRelevance !== bRelevance) {
      return bRelevance - aRelevance;
    }
    
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
};

const calculateRelevanceScore = (newsItem: NewsItem, commodityName: string): number => {
  let score = 0;
  const text = `${newsItem.title} ${newsItem.description}`.toLowerCase();
  const commodity = commodityName.toLowerCase();
  
  if (newsItem.title.toLowerCase().includes(commodity)) score += 10;
  if (newsItem.description.toLowerCase().includes(commodity)) score += 5;
  if (text.includes('price')) score += 3;
  if (text.includes('market')) score += 2;
  if (text.includes('trading')) score += 2;
  if (text.includes('commodity')) score += 3;
  
  const daysSincePublished = (Date.now() - new Date(newsItem.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished <= 7) score += 2;
  
  return score;
};

export const getFallbackNews = (commodityName: string): NewsItem[] => {
  const today = new Date();
  return [
    {
      id: `${commodityName}_fallback_1`,
      title: `${commodityName} prices affected by global supply chain disruptions`,
      description: `Recent developments in global supply chains are impacting ${commodityName} markets with increased volatility.`,
      url: '#',
      source: 'Market Watch',
      publishedAt: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `${commodityName}_fallback_2`,
      title: `New regulations impact ${commodityName.toLowerCase()} market outlook`,
      description: `Regulatory changes are creating new dynamics in the ${commodityName} trading landscape.`,
      url: '#',
      source: 'Reuters',
      publishedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `${commodityName}_fallback_3`,
      title: `Global demand shifts create volatility in ${commodityName.toLowerCase()} prices`,
      description: `Changing global demand patterns are influencing ${commodityName} price movements across major markets.`,
      url: '#',
      source: 'Bloomberg',
      publishedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};
