import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PriceComparison {
  commodity: string;
  commodityPriceAPI: {
    price: number | null;
    error?: string;
    unit?: string;
  };
  fmp: {
    price: number | null;
    error?: string;
    change?: number;
    changePercent?: number;
  };
  difference: {
    absolute: number | null;
    percentage: number | null;
  };
}

interface ComparisonData {
  success: boolean;
  timestamp: string;
  comparisons: PriceComparison[];
  summary: {
    totalCompared: number;
    bothAPIsWorking: number;
    largestDifference: number;
  };
}

export const APIPriceComparison: React.FC = () => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('compare-api-prices', {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch comparison');
      }

      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatDifference = (diff: number | null): string => {
    if (diff === null) return 'N/A';
    return `${diff.toFixed(2)}%`;
  };

  const isPremium = profile?.subscription_active && profile?.subscription_tier !== 'free';

  if (!isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Price Comparison</CardTitle>
          <CardDescription>Compare prices from CommodityPriceAPI and FMP</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Premium subscription required to access API price comparison feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Price Comparison
          <Button
            onClick={fetchComparison}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Comparing...' : 'Compare Prices'}
          </Button>
        </CardTitle>
        <CardDescription>
          Real-time comparison between CommodityPriceAPI and Financial Modeling Prep API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.totalCompared}</div>
                  <p className="text-sm text-muted-foreground">Commodities Compared</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{data.summary.bothAPIsWorking}</div>
                  <p className="text-sm text-muted-foreground">Both APIs Working</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{formatDifference(data.summary.largestDifference)}</div>
                  <p className="text-sm text-muted-foreground">Largest Difference</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead>CommodityPriceAPI</TableHead>
                    <TableHead>FMP API</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.comparisons.map((comparison) => (
                    <TableRow key={comparison.commodity}>
                      <TableCell className="font-medium">
                        {comparison.commodity}
                      </TableCell>
                      <TableCell>
                        {comparison.commodityPriceAPI.error ? (
                          <Badge variant="destructive">{comparison.commodityPriceAPI.error}</Badge>
                        ) : (
                          <div>
                            <div>{formatPrice(comparison.commodityPriceAPI.price)}</div>
                            {comparison.commodityPriceAPI.unit && (
                              <div className="text-xs text-muted-foreground">
                                per {comparison.commodityPriceAPI.unit}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {comparison.fmp.error ? (
                          <Badge variant="destructive">{comparison.fmp.error}</Badge>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              {formatPrice(comparison.fmp.price)}
                              {comparison.fmp.changePercent && (
                                <Badge variant={comparison.fmp.changePercent > 0 ? "default" : "secondary"}>
                                  {comparison.fmp.changePercent > 0 ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                  )}
                                  {comparison.fmp.changePercent.toFixed(2)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {comparison.difference.percentage !== null ? (
                          <div>
                            <div className="font-medium">
                              {formatDifference(comparison.difference.percentage)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${comparison.difference.absolute?.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {comparison.commodityPriceAPI.price && comparison.fmp.price ? (
                          <Badge variant="default">Both Working</Badge>
                        ) : comparison.commodityPriceAPI.price || comparison.fmp.price ? (
                          <Badge variant="secondary">Partial</Badge>
                        ) : (
                          <Badge variant="destructive">Both Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};