import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { SPREAD_PRESETS, computeSpread } from '@/utils/spreadFormulas';
import { limitsFor } from '@/utils/tiers';
import PremiumPaywall from '@/components/PremiumPaywall';

const SpreadCalculator: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const tier = auth?.tier ?? 'free';
  const limits = limitsFor(tier);
  const { data: commodities = [], isLoading } = useAvailableCommodities({ lightweight: true });
  const [paywallOpen, setPaywallOpen] = useState(false);

  const visiblePresets = useMemo(
    () => SPREAD_PRESETS.slice(0, Number.isFinite(limits.spreadPresets) ? limits.spreadPresets : SPREAD_PRESETS.length),
    [limits.spreadPresets],
  );

  const computed = useMemo(() => {
    return visiblePresets.map((p) => ({
      preset: p,
      value: computeSpread(p, commodities.map((c) => ({ name: c.name, price: c.price }))),
    }));
  }, [visiblePresets, commodities]);

  const lockedCount = SPREAD_PRESETS.length - visiblePresets.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Spread Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crack spreads, crush margins, ratios — Bloomberg-style derived prices from live commodity data.
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading prices…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {computed.map(({ preset, value }) => (
            <Card key={preset.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {preset.name}
                  <Badge variant="outline" className="text-xs">{preset.unit}</Badge>
                </CardTitle>
                <CardDescription className="text-xs">{preset.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">
                  {value != null
                    ? preset.unit === 'ratio'
                      ? value.toFixed(2)
                      : `$${value.toFixed(2)}`
                    : <span className="text-muted-foreground text-base">data unavailable</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lockedCount > 0 && (
          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{lockedCount} more preset{lockedCount > 1 ? 's' : ''} on {tier === 'free' ? 'Premium' : 'Pro'}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {tier === 'free'
                    ? 'Unlock 3:2:1 crack, soybean crush, gold/silver ratio, and gas/oil parity.'
                    : 'Upgrade to Pro to build custom spreads with your own formulas.'}
                </p>
              </div>
              <Button onClick={() => setPaywallOpen(true)}>Upgrade</Button>
            </CardContent>
          </Card>
        )}

        {limits.customSpreads && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Custom spreads</CardTitle>
              <CardDescription>
                Coming soon: build your own spread by picking legs and weights. Saved per-account.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      <PremiumPaywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default SpreadCalculator;