import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

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

const LiveFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const isMobile = useIsMobile();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('fetch-commodity-news', {
        body: { category: 'all' }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setNews(data.articles || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-soft">
        <div className="container px-3 sm:px-4 md:px-6 py-3 sm:py-0">
          <div className="flex flex-col sm:flex-row sm:h-16 md:h-20 sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-colors mobile-touch-target">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Markets</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-primary/10 text-primary mobile-touch-target shrink-0">
                  <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gradient truncate">
                    {isMobile ? 'Market News' : 'Live Market News'}
                  </h1>
                  <p className="text-2xs sm:text-xs md:text-sm text-muted-foreground truncate">
                    {isMobile ? 'Real-time updates' : 'Real-time commodity market updates'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNews}
                disabled={loading}
                className="hover:bg-muted/80 transition-colors mobile-button flex-1 sm:flex-initial"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-xs sm:text-sm">Refresh</span>
              </Button>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full border bg-muted/50 whitespace-nowrap">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-2xs sm:text-xs font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Update Info */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              {news.length} articles
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading latest news...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="p-6 text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="font-semibold mb-2">Unable to Load News</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchNews} variant="outline" size="sm">
                Try Again
              </Button>
            </Card>
          )}

          {/* News Articles */}
          {!loading && !error && news.length === 0 && (
            <Card className="p-8 text-center">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No News Available</h3>
              <p className="text-sm text-muted-foreground">
                We couldn't find any recent commodity news. Please try again later.
              </p>
            </Card>
          )}

          {!loading && news.length > 0 && (
            <div className="space-y-4">
              {news.map((article, index) => (
                <Card key={article.id || index} className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 mobile-card">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {article.urlToImage && (
                      <div className="flex-shrink-0 w-full h-48 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-base sm:text-lg leading-tight">
                          {article.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(article.publishedAt)}</span>
                            <span>•</span>
                            <span className="font-medium text-primary">{article.source}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {article.category && (
                            <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                              {article.category}
                            </span>
                          )}
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mobile-touch-target w-full sm:w-auto"
                        >
                          Read more
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LiveFeed;