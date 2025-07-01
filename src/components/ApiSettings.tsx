
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Key, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ApiSettings = () => {
  const [fmpApiKey, setFmpApiKey] = useState('');
  const [showFmp, setShowFmp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedFmp = localStorage.getItem('fmpApiKey');
    
    if (savedFmp) setFmpApiKey(savedFmp);
  }, []);

  const handleSave = () => {
    try {
      if (fmpApiKey) {
        localStorage.setItem('fmpApiKey', fmpApiKey);
      }
      
      toast.success('API key saved successfully!');
      setIsOpen(false);
      
      // Reload the page to use new API key
      window.location.reload();
    } catch (error) {
      toast.error('Failed to save API key');
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
      <Card className="w-full max-w-md p-6 bg-background border border-border shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">API Settings</h3>
            <p className="text-sm text-muted-foreground">Configure your API key for real data</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fmp-key">Financial Modeling Prep API Key</Label>
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
              Get your free API key from{' '}
              <a
                href="https://financialmodelingprep.com/developer/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Financial Modeling Prep
              </a>
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Key
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> The API key is stored locally in your browser. Financial Modeling Prep 
            provides both price data and news data. Without an API key, the app will use fallback data 
            for demonstration purposes.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ApiSettings;
