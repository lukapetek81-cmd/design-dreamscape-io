
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock, Newspaper, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: functionError } = await supabase.functions.invoke('fetch-commodity-news', {
          body: { category: 'all', commodity }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        // Filter news relevant to the specific commodity
        const commodityKeywords = [
          commodity.toLowerCase(),
          ...getRelevantKeywords(commodity)
        ];

        const relevantNews = (data.articles || []).filter((article: NewsItem) => {
          const content = (article.title + ' ' + article.description).toLowerCase();
          return commodityKeywords.some(keyword => content.includes(keyword));
        }).slice(0, 3); // Show only top 3 relevant articles

        setNews(relevantNews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching commodity news:', err);
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
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-300">
          <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-foreground">Latest {commodity} News</h4>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {loading ? 'Loading latest updates...' : 'Recent market updates & insights'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading news...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            Unable to load news: {error}
          </p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-2">📰</div>
          <p className="text-sm text-muted-foreground">
            No recent news found for {commodity}
          </p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {news.map((newsItem, index) => (
            <div 
              key={newsItem.id}
              className="group p-3 sm:p-4 rounded-xl bg-gradient-to-r from-background/50 to-muted/20 border border-border/30 hover:border-border/60 hover:shadow-soft transition-all duration-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                if (newsItem.url && newsItem.url !== '#') {
                  window.open(newsItem.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm sm:text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {newsItem.title}
                  </h5>
                  {newsItem.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                      {newsItem.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      <span className="font-medium">{newsItem.source}</span>
                    </div>
                    <span className="text-muted-foreground/60">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(newsItem.publishedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              loading ? 'bg-blue-500' : error ? 'bg-red-500' : 'bg-green-500'
            }`}></div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {loading ? 'Loading...' : error ? 'Error' : 'Live Updates'}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            {loading ? 'Fetching data...' : 'Updated just now'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CommodityNews;
