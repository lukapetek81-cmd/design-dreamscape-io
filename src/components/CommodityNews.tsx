
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getFallbackNews, EnhancedNewsItem } from '@/services/newsHelpers';
import EnhancedNewsCard from './EnhancedNewsCard';

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

interface CommodityNewsProps {
  commodity: string;
}

const CommodityNews = ({ commodity }: CommodityNewsProps) => {
  const [news, setNews] = React.useState<EnhancedNewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use enhanced edge function for better news coverage
        const { data, error } = await supabase.functions.invoke('enhanced-commodity-news', {
          body: { commodity, source: 'all' }
        });
        
        if (error || !data?.articles) {
          console.warn('Enhanced news API failed, using fallback:', error);
          const fallbackNews = getFallbackNews(commodity);
          setNews(fallbackNews);
        } else {
          // Convert to enhanced news items
          const enhancedNews = data.articles.map((article: any) => ({
            ...article,
            sentiment: 'neutral' as const,
            category: article.category || 'general' as const,
            relevanceScore: 70,
            tags: []
          }));
          setNews(enhancedNews);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching commodity news:', err);
        // Use fallback news on error
        const fallbackNews = getFallbackNews(commodity);
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [commodity]);

  const getRelevantKeywords = (commodityName: string): string[] => {
    const name = commodityName.toLowerCase();
    
    if (name.includes('oil') || name.includes('crude')) {
      return ['oil', 'crude', 'petroleum', 'energy'];
    }
    if (name.includes('gold')) {
      return ['gold', 'precious metals'];
    }
    if (name.includes('silver')) {
      return ['silver', 'precious metals'];
    }
    if (name.includes('copper')) {
      return ['copper', 'industrial metals'];
    }
    if (name.includes('wheat')) {
      return ['wheat', 'grain', 'agriculture'];
    }
    if (name.includes('corn')) {
      return ['corn', 'grain', 'agriculture'];
    }
    if (name.includes('gas')) {
      return ['natural gas', 'gas', 'energy'];
    }
    if (name.includes('coffee')) {
      return ['coffee', 'soft commodities'];
    }
    if (name.includes('sugar')) {
      return ['sugar', 'soft commodities'];
    }
    if (name.includes('cattle')) {
      return ['cattle', 'livestock', 'beef'];
    }
    
    return [];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return 'Now';
    }
  };

  return (
    <Card className="p-4 sm:p-6 mt-4 sm:mt-6 bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-foreground">Enhanced {commodity} News</h4>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {loading ? 'Loading with sentiment analysis...' : `${news.length} articles with smart insights`}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-muted-foreground">Analyzing news...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
            Unable to load enhanced news: {error}
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Configure API keys in settings for better news coverage
          </p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="font-semibold mb-2">No Recent News</h3>
          <p className="text-sm text-muted-foreground">
            No recent news found for {commodity}
          </p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="space-y-4">
          {news.map((newsItem, index) => (
            <EnhancedNewsCard
              key={newsItem.id}
              news={newsItem}
              commodityName={commodity}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default CommodityNews;
