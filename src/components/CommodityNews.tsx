
import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquareText, Clock, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
}

interface CommodityNewsProps {
  commodity: string;
}

const CommodityNews = ({ commodity }: CommodityNewsProps) => {
  // Mock news data - in a real app, this would come from an API
  const getMockNews = (commodity: string): NewsItem[] => {
    const today = new Date();
    return [
      {
        id: '1',
        title: `${commodity} prices affected by global supply chain disruptions`,
        date: new Date(today.setDate(today.getDate() - 1)).toLocaleDateString(),
        source: 'Market Watch'
      },
      {
        id: '2',
        title: `New regulations impact ${commodity.toLowerCase()} market outlook`,
        date: new Date(today.setDate(today.getDate() - 2)).toLocaleDateString(),
        source: 'Reuters'
      },
      {
        id: '3',
        title: `Global demand shifts create volatility in ${commodity.toLowerCase()} prices`,
        date: new Date(today.setDate(today.getDate() - 3)).toLocaleDateString(),
        source: 'Bloomberg'
      }
    ];
  };

  return (
    <Card className="p-4 sm:p-6 mt-4 sm:mt-6 bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-300">
          <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-foreground">Latest {commodity} News</h4>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Recent market updates & insights
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {getMockNews(commodity).map((news, index) => (
          <div 
            key={news.id}
            className="group p-3 sm:p-4 rounded-xl bg-gradient-to-r from-background/50 to-muted/20 border border-border/30 hover:border-border/60 hover:shadow-soft transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h5 className="text-sm sm:text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {news.title}
                </h5>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <span className="font-medium">{news.source}</span>
                  </div>
                  <span className="text-muted-foreground/60">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{news.date}</span>
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

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold text-foreground">Live Updates</span>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            Updated 5 minutes ago
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CommodityNews;
