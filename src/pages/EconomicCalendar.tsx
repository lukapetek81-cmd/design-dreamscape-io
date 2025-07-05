import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Clock, TrendingUp, AlertTriangle, Star, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EconomicEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  impact: 'low' | 'medium' | 'high';
  country: string;
  category: string;
  previous?: string;
  forecast?: string;
  actual?: string;
  commodityImpact: string[];
}

const EconomicCalendar = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock economic events data
  const events: EconomicEvent[] = [
    {
      id: '1',
      title: 'US Non-Farm Payrolls',
      description: 'Monthly employment data showing job creation in non-agricultural sectors',
      date: '2024-07-05',
      time: '08:30',
      impact: 'high',
      country: 'US',
      category: 'employment',
      previous: '272K',
      forecast: '190K',
      actual: '206K',
      commodityImpact: ['Gold Futures', 'Crude Oil', 'USD Index']
    },
    {
      id: '2',
      title: 'OPEC+ Meeting',
      description: 'Monthly meeting to discuss oil production quotas and market conditions',
      date: '2024-07-05',
      time: '12:00',
      impact: 'high',
      country: 'Global',
      category: 'energy',
      commodityImpact: ['Crude Oil', 'Natural Gas', 'Gasoline RBOB']
    },
    {
      id: '3',
      title: 'US CPI Inflation Data',
      description: 'Consumer Price Index measuring inflation trends',
      date: '2024-07-06',
      time: '08:30',
      impact: 'high',
      country: 'US',
      category: 'inflation',
      previous: '3.4%',
      forecast: '3.1%',
      commodityImpact: ['Gold Futures', 'Silver Futures', 'Treasury Bonds']
    },
    {
      id: '4',
      title: 'China Manufacturing PMI',
      description: 'Purchasing Managers Index indicating manufacturing sector health',
      date: '2024-07-06',
      time: '02:00',
      impact: 'medium',
      country: 'China',
      category: 'manufacturing',
      previous: '49.5',
      forecast: '50.2',
      commodityImpact: ['Copper', 'Iron Ore', 'Steel']
    },
    {
      id: '5',
      title: 'USDA Crop Report',
      description: 'Monthly report on crop conditions and yield estimates',
      date: '2024-07-07',
      time: '12:00',
      impact: 'high',
      country: 'US',
      category: 'agriculture',
      commodityImpact: ['Corn Futures', 'Wheat Futures', 'Soybean Futures']
    },
    {
      id: '6',
      title: 'Fed Interest Rate Decision',
      description: 'Federal Reserve monetary policy meeting and rate announcement',
      date: '2024-07-08',
      time: '14:00',
      impact: 'high',
      country: 'US',
      category: 'monetary',
      commodityImpact: ['Gold Futures', 'Silver Futures', 'USD Index', 'Treasury Bonds']
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4" />;
      case 'low':
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedImpact !== 'all' && event.impact !== selectedImpact) return false;
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
    return true;
  });

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  const categories = Array.from(new Set(events.map(e => e.category)));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Economic Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Track key economic events and their potential impact on commodity markets
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedImpact} onValueChange={setSelectedImpact}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Impact Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact Levels</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar View */}
      <div className="space-y-6">
        {Object.entries(groupedEvents)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, dateEvents]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>
                {dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dateEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <Badge variant="outline" className={`border ${getImpactColor(event.impact)}`}>
                          <div className="flex items-center gap-1">
                            {getImpactIcon(event.impact)}
                            {event.impact.toUpperCase()}
                          </div>
                        </Badge>
                        <Badge variant="secondary">{event.country}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>

                      {(event.previous || event.forecast || event.actual) && (
                        <div className="grid grid-cols-3 gap-4 bg-muted/30 rounded-lg p-3">
                          {event.previous && (
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Previous</p>
                              <p className="font-semibold">{event.previous}</p>
                            </div>
                          )}
                          {event.forecast && (
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Forecast</p>
                              <p className="font-semibold">{event.forecast}</p>
                            </div>
                          )}
                          {event.actual && (
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Actual</p>
                              <p className="font-semibold text-primary">{event.actual}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Potential Commodity Impact:</p>
                        <div className="flex flex-wrap gap-2">
                          {event.commodityImpact.map(commodity => (
                            <Badge key={commodity} variant="outline" className="text-xs">
                              {commodity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groupedEvents).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Events Found</h3>
            <p className="text-muted-foreground">No economic events match your current filters</p>
          </CardContent>
        </Card>
      )}

      {!profile?.subscription_active && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade for Premium Calendar</h3>
                <p className="text-muted-foreground">Get email alerts, custom notifications, and detailed impact analysis.</p>
              </div>
              <Button className="ml-4">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EconomicCalendar;