import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Key, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewsSettings: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    fmpApiKey: '',
    newsApiKey: '',
    alphaVantageApiKey: '',
    marketauxApiKey: '',
    polygonApiKey: ''
  });
  
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load existing API keys from localStorage
    setApiKeys({
      fmpApiKey: localStorage.getItem('fmpApiKey') || '',
      newsApiKey: localStorage.getItem('newsApiKey') || '',
      alphaVantageApiKey: localStorage.getItem('alphaVantageApiKey') || '',
      marketauxApiKey: localStorage.getItem('marketauxApiKey') || '',
      polygonApiKey: localStorage.getItem('polygonApiKey') || ''
    });
  }, []);

  const handleSave = (keyName: string, value: string) => {
    localStorage.setItem(keyName, value);
    setApiKeys(prev => ({ ...prev, [keyName]: value }));
    toast({
      title: "API Key Saved",
      description: `${keyName} has been saved successfully.`,
    });
  };

  const handleTest = async (keyName: string, apiKey: string) => {
    if (!apiKey.trim()) return;
    
    setTesting(prev => ({ ...prev, [keyName]: true }));
    
    try {
      let isValid = false;
      
      // Simple validation tests for each API
      switch (keyName) {
        case 'fmpApiKey':
          const fmpResponse = await fetch(`https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${apiKey}`);
          isValid = fmpResponse.ok;
          break;
        case 'newsApiKey':
          const newsResponse = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${apiKey}`);
          isValid = newsResponse.ok;
          break;
        case 'alphaVantageApiKey':
          const avResponse = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=${apiKey}`);
          isValid = avResponse.ok;
          break;
        case 'marketauxApiKey':
          const marketauxResponse = await fetch(`https://api.marketaux.com/v1/news/all?api_token=${apiKey}&limit=1`);
          isValid = marketauxResponse.ok;
          break;
        case 'polygonApiKey':
          const polygonResponse = await fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apikey=${apiKey}`);
          isValid = polygonResponse.ok;
          break;
      }
      
      setTestResults(prev => ({ ...prev, [keyName]: isValid }));
      
      toast({
        title: isValid ? "API Key Valid" : "API Key Invalid",
        description: isValid ? `${keyName} is working correctly.` : `${keyName} failed validation.`,
        variant: isValid ? "default" : "destructive",
      });
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, [keyName]: false }));
      toast({
        title: "Test Failed",
        description: `Unable to test ${keyName}. Please check your connection.`,
        variant: "destructive",
      });
    } finally {
      setTesting(prev => ({ ...prev, [keyName]: false }));
    }
  };

  const apiSources = [
    {
      key: 'fmpApiKey',
      name: 'Financial Modeling Prep',
      description: 'General financial news and company data',
      placeholder: 'Your FMP API key',
      website: 'https://financialmodelingprep.com/',
      priority: 'High'
    },
    {
      key: 'newsApiKey',
      name: 'NewsAPI',
      description: 'Global news aggregation service',
      placeholder: 'Your NewsAPI key',
      website: 'https://newsapi.org/',
      priority: 'Medium'
    },
    {
      key: 'alphaVantageApiKey',
      name: 'Alpha Vantage',
      description: 'Financial data and news sentiment',
      placeholder: 'Your Alpha Vantage key',
      website: 'https://www.alphavantage.co/',
      priority: 'Medium'
    },
    {
      key: 'marketauxApiKey',
      name: 'Marketaux',
      description: 'Real-time financial news aggregator',
      placeholder: 'Your Marketaux API token',
      website: 'https://www.marketaux.com/',
      priority: 'High'
    },
    {
      key: 'polygonApiKey',
      name: 'Polygon.io',
      description: 'Financial market data and news',
      placeholder: 'Your Polygon API key',
      website: 'https://polygon.io/',
      priority: 'Medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 dark:bg-red-950/20 text-red-800 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-950/20 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          News API Configuration
        </CardTitle>
        <CardDescription>
          Configure API keys for enhanced news sources. More sources = better news coverage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {apiSources.map((source, index) => (
          <div key={source.key}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor={source.key} className="font-semibold">
                    {source.name}
                  </Label>
                  <Badge className={getPriorityColor(source.priority)}>
                    {source.priority}
                  </Badge>
                  {testResults[source.key] !== undefined && (
                    <Badge variant={testResults[source.key] ? "default" : "destructive"}>
                      {testResults[source.key] ? (
                        <><Check className="w-3 h-3 mr-1" />Valid</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" />Invalid</>
                      )}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(source.website, '_blank')}
                >
                  Get API Key
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {source.description}
              </p>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id={source.key}
                    type="password"
                    placeholder={source.placeholder}
                    value={apiKeys[source.key as keyof typeof apiKeys]}
                    onChange={(e) => setApiKeys(prev => ({ 
                      ...prev, 
                      [source.key]: e.target.value 
                    }))}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleSave(source.key, apiKeys[source.key as keyof typeof apiKeys])}
                  disabled={!apiKeys[source.key as keyof typeof apiKeys].trim()}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTest(source.key, apiKeys[source.key as keyof typeof apiKeys])}
                  disabled={!apiKeys[source.key as keyof typeof apiKeys].trim() || testing[source.key]}
                >
                  {testing[source.key] ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </div>
            
            {index < apiSources.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
        
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Pro Tips for Better News
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Configure at least 2-3 API keys for comprehensive coverage</li>
            <li>• High priority sources provide the most relevant financial news</li>
            <li>• Test your API keys regularly to ensure they're working</li>
            <li>• Some APIs have rate limits - the app will handle this automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsSettings;