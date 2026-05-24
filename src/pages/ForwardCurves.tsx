import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Lock, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
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
  const { data, isLoading, error } = useForwardCurve(isPro ? commodity : null);

  const structureColor = data?.structure === 'contango' ? 'text-orange-500'
    : data?.structure === 'backwardation' ? 'text-emerald-500'
    : 'text-muted-foreground';

  const StructureIcon = data?.structure === 'backwardation' ? TrendingDown
    : data?.structure === 'contango' ? TrendingUp : Activity;

  const chartData = (data?.curve ?? []).map((p) => ({
    name: p.expiry.slice(2).replace('-', '/'),
    price: p.price,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
        </Button>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Forward Curves
              <Badge variant="default" className="ml-1 bg-gradient-to-r from-violet-600 to-indigo-600">Pro</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Futures strip across 12 monthly contracts. Detect contango/backwardation and roll yield.
            </p>
          </div>
        </div>

        {isPro && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-amber-600 dark:text-amber-400">Modelled curve.</span>{' '}
              Spot price is live; forward contracts are estimated via a cost-of-carry model
              (risk-free rate + storage − convenience yield, plus seasonal multipliers where applicable).
              Real exchange futures data can be wired in later — UI stays identical.
            </div>
          </div>
        )}

        {!isPro ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Forward curves are a Pro feature</p>
                <p className="text-sm text-muted-foreground mt-1">
                  See the full futures strip, contango/backwardation status, and roll yield across all major commodities.
                </p>
              </div>
              <Button onClick={() => setPaywallOpen(true)}>Upgrade to Pro</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 w-full max-w-xs">
              <Select value={commodity} onValueChange={setCommodity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURVE_COMMODITIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Loading curve…</p>}
            {error && <p className="text-sm text-destructive">Failed to load forward curve.</p>}

            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`flex items-center gap-2 text-2xl font-bold capitalize ${structureColor}`}>
                      <StructureIcon className="w-6 h-6" />
                      {data.structure}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.structure === 'contango' && 'Future prices > spot — storage costs / oversupply.'}
                      {data.structure === 'backwardation' && 'Future prices < spot — tight supply / strong demand.'}
                      {data.structure === 'flat' && 'No clear directional bias.'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardDescription>M1 → M2 Roll Yield</CardDescription></CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${data.rollYield && data.rollYield > 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {data.rollYield != null ? `${data.rollYield.toFixed(2)}%` : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Annualised: {data.rollYield != null ? `${(data.rollYield * 12).toFixed(1)}%` : '—'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardDescription>M1 / M2 Price</CardDescription></CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${data.m1?.toFixed(2) ?? '—'} <span className="text-muted-foreground text-base">→</span> ${data.m2?.toFixed(2) ?? '—'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Curve</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(v: number) => `$${v.toFixed(2)}`}
                      />
                      {data.m1 && <ReferenceLine y={data.m1} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />}
                      <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
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