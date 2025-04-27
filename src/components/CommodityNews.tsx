
import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';

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
    <Card className="p-4 mt-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareText className="w-5 h-5 text-gray-600" />
        <h4 className="text-sm font-medium text-gray-700">Latest {commodity} News</h4>
      </div>
      <div className="space-y-3">
        {getMockNews(commodity).map((news) => (
          <div key={news.id} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
            <h5 className="text-sm font-medium mb-1">{news.title}</h5>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{news.source}</span>
              <span>•</span>
              <span>{news.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CommodityNews;
