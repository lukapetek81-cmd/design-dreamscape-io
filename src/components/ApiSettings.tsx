
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ApiSettings = () => {
  const [fmpApiKey, setFmpApiKey] = React.useState('');
  const [newsApiKey, setNewsApiKey] = React.useState('');
  const [alphaVantageApiKey, setAlphaVantageApiKey] = React.useState('');
  const [showFmp, setShowFmp] = React.useState(false);
  const [showNews, setShowNews] = React.useState(false);
  const [showAlpha, setShowAlpha] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Load saved API keys from localStorage
    const savedFmp = localStorage.getItem('fmpApiKey');
    const savedNews = localStorage.getItem('newsApiKey');
    const savedAlpha = localStorage.getItem('alphaVantageApiKey');
    
    if (savedFmp) setFmpApiKey(savedFmp);
    if (savedNews) setNewsApiKey(savedNews);
    if (savedAlpha) setAlphaVantageApiKey(savedAlpha);
  }, []);

  const handleSave = () => {
    try {
      if (fmpApiKey) {
        localStorage.setItem('fmpApiKey', fmpApiKey);
      }
      if (newsApiKey) {
        localStorage.setItem('newsApiKey', newsApiKey);
      }
      if (alphaVantageApiKey) {
        localStorage.setItem('alphaVantageApiKey', alphaVantageApiKey);
      }
      
      toast.success('API keys saved successfully!');
      setIsOpen(false);
      
      // Reload the page to use new API keys
      window.location.reload();
    } catch (error) {
      toast.error('Failed to save API keys');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Settings className="w-4 h-4 mr-2" />
        API Settings
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-6 bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">API Settings</h3>
            <p className="text-sm text-muted-foreground">Configure your API keys for comprehensive commodity news</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Financial Modeling Prep API */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="fmp-key">Financial Modeling Prep API Key</Label>
              <a
                href="https://financialmodelingprep.com/developer/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                id="fmp-key"
                type={showFmp ? "text" : "password"}
                value={fmpApiKey}
                onChange={(e) => setFmpApiKey(e.target.value)}
                placeholder="Enter your FMP API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowFmp(!showFmp)}
              >
                {showFmp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for commodity prices and general market news
            </p>
          </div>

          {/* NewsAPI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="news-key">NewsAPI Key</Label>
              <a
                href="https://newsapi.org/register"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                id="news-key"
                type={showNews ? "text" : "password"}
                value={newsApiKey}
                onChange={(e) => setNewsApiKey(e.target.value)}
                placeholder="Enter your NewsAPI key (optional)"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNews(!showNews)}
              >
                {showNews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Provides comprehensive news coverage from thousands of sources
            </p>
          </div>

          {/* Alpha Vantage API */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alpha-key">Alpha Vantage API Key</Label>
              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <Input
                id="alpha-key"
                type={showAlpha ? "text" : "password"}
                value={alphaVantageApiKey}
                onChange={(e) => setAlphaVantageApiKey(e.target.value)}
                placeholder="Enter your Alpha Vantage key (optional)"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowAlpha(!showAlpha)}
              >
                {showAlpha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Provides news sentiment analysis and financial market intelligence
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Keys
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Multiple News Sources:</strong> The app now combines news from Financial Modeling Prep, 
            NewsAPI, and Alpha Vantage to provide more comprehensive and relevant commodity news. 
            API keys are stored locally in your browser. Without API keys, the app will use fallback data.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApiSettings;
