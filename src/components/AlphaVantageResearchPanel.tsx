import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Search, AlertTriangle, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useAlphaVantageResearch } from '@/hooks/useAlphaVantageResearch';

export const AlphaVantageResearchPanel = () => {
  const { data, isLoading, error, refetch } = useAlphaVantageResearch();

  if (isLoading) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Researching Alpha Vantage Futures Capabilities
          </CardTitle>
          <CardDescription>
            Testing commodity endpoints, time series data, and futures contract support...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
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

  const { results, summary, recommendations } = data || {};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rate_limited':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'rate_limited':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Rate Limited</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Alpha Vantage Futures Research Results
          </CardTitle>
          <CardDescription>
            Analysis of Alpha Vantage API capabilities for professional futures trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary?.successfulEndpoints || 0}</div>
              <div className="text-xs text-green-700 dark:text-green-400">Successful</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary?.rateLimitedEndpoints || 0}</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-400">Rate Limited</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary?.errorEndpoints || 0}</div>
              <div className="text-xs text-red-700 dark:text-red-400">Errors</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary?.totalEndpoints || 0}</div>
              <div className="text-xs text-blue-700 dark:text-blue-400">Total Tested</div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Assessment & Recommendations
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {recommendations.supportsCommodities ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span>Commodities Support: {recommendations.supportsCommodities ? 'Available' : 'Limited'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {recommendations.hasTimeSeriesData ? 
                    <CheckCircle className="h-4 w-4 text-green-500" /> : 
                    <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span>Time Series Data: {recommendations.hasTimeSeriesData ? 'Available' : 'Not Found'}</span>
                </div>
                {recommendations.rateLimited && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Note: Some endpoints are rate limited</span>
                  </div>
                )}
                <div className="mt-3 p-3 bg-background rounded border-l-4 border-primary">
                  <strong>Next Steps:</strong> {recommendations.nextSteps}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Endpoint Test Results
          </CardTitle>
          <CardDescription>
            Detailed analysis of each Alpha Vantage API endpoint tested
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {results && Object.entries(results).map(([endpoint, result]: [string, any]) => (
              <div key={endpoint} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {endpoint}
                    </code>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                {result.status === 'success' && (
                  <div className="space-y-3">
                    {result.metadata && (
                      <div className="text-sm">
                        <strong>Metadata:</strong>
                        <div className="bg-muted p-2 rounded text-xs mt-1">
                          <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Data Keys:</span>
                        <div className="text-muted-foreground">{result.dataKeys?.length || 0} fields</div>
                      </div>
                      <div>
                        <span className="font-medium">Time Series:</span>
                        <div className="text-muted-foreground">{result.hasTimeSeriesData ? 'Yes' : 'No'}</div>
                      </div>
                      <div>
                        <span className="font-medium">Sample Count:</span>
                        <div className="text-muted-foreground">{result.sampleCount || 0} items</div>
                      </div>
                    </div>
                    
                    {result.sample && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium mb-2">Sample Data</summary>
                        <div className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                          <pre>{JSON.stringify(result.sample, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                )}
                
                {result.status === 'rate_limited' && (
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">
                    Rate Limited: {result.note}
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
              Re-run Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};