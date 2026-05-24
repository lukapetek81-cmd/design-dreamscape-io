import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Lock, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useForwardCurve } from '@/hooks/useForwardCurve';
import { CURVE_COMMODITIES } from '@/utils/forwardCurveSymbols';
import PremiumPaywall from '@/components/PremiumPaywall';

const ForwardCurves: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const isPro = auth?.isPro ?? false;
  const [commodity, setCommodity] = useState<string>('wti');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { data, isLoading, error, refetch, isFetching } = useForwardCurve(isPro ? commodity : null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Live Front-Month
            <Badge variant="default" className="ml-1 bg-gradient-to-r from-violet-600 to-indigo-600">Pro</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time spot/front-month price for major commodities.
          </p>
        </div>

        {isPro && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-amber-600 dark:text-amber-400">Curve view temporarily disabled.</span>{' '}
              FMP Starter doesn't expose individual monthly contracts, so the full
              forward strip is unavailable. Showing the live front-month only until
              a per-contract data provider is added.
            </div>
          </div>
        )}

        {!isPro ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Live commodity quotes are a Pro feature</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Track real-time spot prices across all major energy, metal, and grain benchmarks.
                </p>
              </div>
              <Button onClick={() => setPaywallOpen(true)}>Upgrade to Pro</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <div className="w-full max-w-xs">
                <Select value={commodity} onValueChange={setCommodity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURVE_COMMODITIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {error && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="pt-6 text-sm text-destructive">
                  Failed to fetch live quote. Try again shortly.
                </CardContent>
              </Card>
            )}

            {data && (
              <Card className="border-amber-500/20 bg-[#07090d] text-amber-50 shadow-2xl shadow-amber-500/5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-500/15 bg-[#0b0f15] px-4 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400/80">
                  <span>{data.label} · Spot</span>
                  <span>{data.provider}</span>
                </div>
                <CardContent className="py-10 text-center">
                  <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500/70 mb-2">
                    Live Front-Month
                  </div>
                  <div className="font-mono text-6xl sm:text-7xl font-semibold tabular-nums text-amber-200">
                    ${data.spot.toFixed(2)}
                  </div>
                  <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500/60">
                    As of {new Date(data.asOf).toUTCString().slice(17, 25)} UTC
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      <PremiumPaywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default ForwardCurves;
