import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Commodity } from '@/hooks/useCommodityData';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

interface CommodityOverviewProps {
  commodities: Commodity[];
  loading: boolean;
}

const CommodityOverview = ({ commodities, loading }: CommodityOverviewProps) => {
  if (loading || commodities.length === 0) return null;

  // Calculate overall statistics
  const totalCommodities = commodities.length;
  const gainers = commodities.filter(c => c.changePercent > 0);
  const losers = commodities.filter(c => c.changePercent < 0);
  const unchanged = commodities.filter(c => c.changePercent === 0);
  
  const topGainer = commodities.reduce((max, commodity) => 
    commodity.changePercent > max.changePercent ? commodity : max
  );
  
  const topLoser = commodities.reduce((min, commodity) => 
    commodity.changePercent < min.changePercent ? commodity : min
  );

  const avgChange = commodities.reduce((sum, c) => sum + c.changePercent, 0) / commodities.length;
  
  // Group by categories for pie chart-like display
  const categoryStats = commodities.reduce((acc, commodity) => {
    if (!acc[commodity.category]) {
      acc[commodity.category] = { count: 0, avgChange: 0, totalChange: 0 };
    }
    acc[commodity.category].count += 1;
    acc[commodity.category].totalChange += commodity.changePercent;
    acc[commodity.category].avgChange = acc[commodity.category].totalChange / acc[commodity.category].count;
    return acc;
  }, {} as Record<string, { count: number; avgChange: number; totalChange: number }>);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'energy':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'metals':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'grains':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'livestock':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'softs':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'other':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      default:
        return 'bg-primary/10 text-primary border-border';
    }
  };

  return (
    <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Market Overview */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-card via-card to-card/80 border border-border/50 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-foreground">Market Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div className="text-center p-3 rounded-xl bg-background/50">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalCommodities}</p>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Total Commodities</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-950/20">
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{gainers.length}</p>
            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Gainers</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{losers.length}</p>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Losers</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(1)}%
            </p>
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Avg Change</p>
          </div>
        </div>
      </Card>

      {/* Top Movers and Category Breakdown */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Top Movers */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-card via-card to-card/80 border border-border/50 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Top Movers</h3>
          </div>
          
          <div className="space-y-3">
            {/* Top Gainer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400 text-sm">{topGainer.name}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">{topGainer.symbol}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-700">
                +{topGainer.changePercent.toFixed(2)}%
              </Badge>
            </div>
            
            {/* Top Loser */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 text-sm">{topLoser.name}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">{topLoser.symbol}</p>
                </div>
              </div>
              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-700">
                {topLoser.changePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </Card>

        {/* Category Performance */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-card via-card to-card/80 border border-border/50 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Category Performance</h3>
          </div>
          
          <div className="space-y-2">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-background/30">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium capitalize ${getCategoryColor(category)}`}
                  >
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{stats.count} items</span>
                </div>
                <Badge 
                  variant={stats.avgChange >= 0 ? "default" : "destructive"}
                  className={`text-xs font-bold ${
                    stats.avgChange >= 0 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                  }`}
                >
                  {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommodityOverview;