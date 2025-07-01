
import { NewsItem } from './commodityApi';

export const fetchNewsFromFMP = async (commodityName: string): Promise<NewsItem[]> => {
  const getFmpApiKey = () => localStorage.getItem('fmpApiKey') || 'demo';
  const apiKey = getFmpApiKey();
  
  const response = await fetch(
    `https://financialmodelingprep.com/api/v3/general_news?page=0&apikey=${apiKey}`
  );
  
  if (!response.ok) throw new Error(`FMP API error: ${response.status}`);
  
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  
  return data
    .filter(article => isRelevantToCommodity(article.title, article.text, commodityName))
    .slice(0, 3)
    .map((article: any, index: number) => ({
      id: `fmp_${commodityName}_${index}_${Date.now()}`,
      title: article.title || `${commodityName} Market Update`,
      description: article.text ? article.text.substring(0, 200) + '...' : `Latest market news about ${commodityName}`,
      url: article.url || '#',
      source: article.site || 'Financial News',
      publishedAt: article.publishedDate || new Date().toISOString(),
      urlToImage: article.image
    }));
};

export const fetchNewsFromNewsAPI = async (commodityName: string): Promise<NewsItem[]> => {
  const getNewsApiKey = () => localStorage.getItem('newsApiKey') || '';
  const apiKey = getNewsApiKey();
  if (!apiKey) return [];

  const query = buildNewsQuery(commodityName);
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${apiKey}`
  );
  
  if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`);
  
  const data = await response.json();
  if (!data.articles || !Array.isArray(data.articles)) return [];
  
  return data.articles
    .slice(0, 3)
    .map((article: any, index: number) => ({
      id: `newsapi_${commodityName}_${index}_${Date.now()}`,
      title: article.title || `${commodityName} News`,
      description: article.description || `Latest ${commodityName} market developments`,
      url: article.url || '#',
      source: article.source?.name || 'News API',
      publishedAt: article.publishedAt || new Date().toISOString(),
      urlToImage: article.urlToImage
    }));
};

export const fetchNewsFromAlphaVantage = async (commodityName: string): Promise<NewsItem[]> => {
  const getAlphaVantageApiKey = () => localStorage.getItem('alphaVantageApiKey') || '';
  const apiKey = getAlphaVantageApiKey();
  if (!apiKey) return [];

  const topics = getCommodityTopics(commodityName);
  const response = await fetch(
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&apikey=${apiKey}`
  );
  
  if (!response.ok) throw new Error(`Alpha Vantage error: ${response.status}`);
  
  const data = await response.json();
  if (!data.feed || !Array.isArray(data.feed)) return [];
  
  return data.feed
    .filter((article: any) => isRelevantToCommodity(article.title, article.summary, commodityName))
    .slice(0, 3)
    .map((article: any, index: number) => ({
      id: `av_${commodityName}_${index}_${Date.now()}`,
      title: article.title || `${commodityName} Analysis`,
      description: article.summary ? article.summary.substring(0, 200) + '...' : `Market analysis for ${commodityName}`,
      url: article.url || '#',
      source: article.source || 'Alpha Vantage',
      publishedAt: article.time_published || new Date().toISOString(),
      urlToImage: article.banner_image
    }));
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

const getCommodityTopics = (commodityName: string): string => {
  const topicMap: Record<string, string> = {
    'Gold': 'economy_macro,energy_transportation',
    'Silver': 'economy_macro,manufacturing',
    'Copper': 'manufacturing,economy_macro',
    'WTI Crude': 'energy_transportation,economy_macro',
    'Brent Crude': 'energy_transportation,economy_macro',
    'Natural Gas': 'energy_transportation,economy_macro',
    'Corn': 'economy_macro',
    'Wheat': 'economy_macro',
    'Soybeans': 'economy_macro'
  };
  
  return topicMap[commodityName] || 'economy_macro';
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
