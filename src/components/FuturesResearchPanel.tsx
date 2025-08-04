import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import { useFuturesResearch } from '@/hooks/useFuturesResearch';
import { AlphaVantageResearchPanel } from './AlphaVantageResearchPanel';

export const FuturesResearchPanel = () => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Tabs defaultValue="alpha-vantage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alpha-vantage">Alpha Vantage Research</TabsTrigger>
          <TabsTrigger value="fmp">FMP Research</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alpha-vantage" className="space-y-4">
          <AlphaVantageResearchPanel />
        </TabsContent>
        
        <TabsContent value="fmp" className="space-y-4">
          <FMPResearchContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const FMPResearchContent = () => {
  const { data, isLoading, error, refetch } = useFuturesResearch();

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Researching FMP Futures Capabilities
          </CardTitle>
          <CardDescription>
            Investigating what futures contract data is available from FMP API...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Research Failed
          </CardTitle>
          <CardDescription>
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Retry Research
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { results, summary } = data || {};

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            FMP Futures Research Results
          </CardTitle>
          <CardDescription>
            Successfully tested {summary?.successfulEndpoints || 0} of {summary?.totalEndpoints || 0} endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {results && Object.entries(results).map(([endpoint, result]: [string, any]) => (
              <div key={endpoint} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint}
                  </code>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                
                {result.status === 'success' && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Type: {result.dataType} | Count: {result.sampleCount}
                    </div>
                    {result.sample && (
                      <div className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                        <pre>{JSON.stringify(result.sample, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="text-sm text-destructive">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Re-run Research
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};