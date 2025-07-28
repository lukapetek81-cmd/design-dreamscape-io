import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ExternalLink, Key, Shield } from 'lucide-react';
import { useCommodityPriceAPI } from '@/contexts/CommodityPriceAPIContext';
import { useCommodityPriceAPICredentials } from '@/hooks/useCommodityPriceAPICredentials';

export const CommodityPriceAPICredentialsManager: React.FC = () => {
  const { connect, disconnect, connected, error, isConnecting, usage } = useCommodityPriceAPI();
  const { storedCredentials, saveCredentials, clearCredentials } = useCommodityPriceAPICredentials();
  
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (storedCredentials) {
      setApiKey('***************'); // Show masked version
    }
  }, [storedCredentials]);

  const handleConnect = async () => {
    if (!apiKey || apiKey === '***************') {
      return;
    }

    try {
      await connect({ apiKey });
      await saveCredentials({ apiKey });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleClearCredentials = async () => {
    await clearCredentials();
    setApiKey('');
    handleDisconnect();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            CommodityPriceAPI Credentials
          </CardTitle>
          <CardDescription>
            Configure your CommodityPriceAPI credentials for real-time commodity data access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your CommodityPriceAPI key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {!connected ? (
              <Button 
                onClick={handleConnect} 
                disabled={!apiKey || apiKey === '***************' || isConnecting}
                className="flex-1"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            ) : (
              <Button onClick={handleDisconnect} variant="outline" className="flex-1">
                Disconnect
              </Button>
            )}
            
            {storedCredentials && (
              <Button onClick={handleClearCredentials} variant="destructive">
                Clear
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2">
            <Badge variant={connected ? 'default' : 'secondary'}>
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
            
            {usage && (
              <Badge variant="outline">
                {usage.used}/{usage.quota} API calls ({usage.plan})
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Get your API key from{' '}
              <a 
                href="https://commoditypriceapi.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                CommodityPriceAPI Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Your API key is encrypted and stored securely
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};