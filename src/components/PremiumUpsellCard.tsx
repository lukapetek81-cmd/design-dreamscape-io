import React from 'react';
import { Lock, Factory, Zap, Gem, Wheat, Coffee } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumPaywall from '@/components/PremiumPaywall';

type UpsellVariant = 'energy' | 'industrials' | 'metals' | 'grains' | 'softs';

interface PremiumUpsellCardProps {
  onUpgrade?: () => void;
  variant?: UpsellVariant;
}

const COPY: Record<UpsellVariant, {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  energy: {
    title: 'Unlock 13 Premium Energy Markets',
    description: 'Regional crude blends (WCS, WTI Midland, Mars, LLS), refined products, and marine bunker fuels.',
    Icon: Zap,
  },
  industrials: {
    title: 'Unlock Premium Industrial Commodities',
    description: 'Rhodium, plastics, fertilizers, and rare elements (full industrials catalog).',
    Icon: Factory,
  },
  metals: {
    title: 'Unlock 8 More Industrial & Specialty Metals',
    description: 'Lead, Nickel, Tin, Steel, HRC Steel, Titanium, Lithium, and Cobalt.',
    Icon: Gem,
  },
  grains: {
    title: 'Unlock 2 More Grain & Oil Markets',
    description: 'Canola and Sunflower Oil — global vegetable-oil benchmarks.',
    Icon: Wheat,
  },
  softs: {
    title: 'Unlock 2 More Soft Commodities',
    description: 'UK Sugar No 5 (white sugar) and Palm Oil.',
    Icon: Coffee,
  },
};

const PremiumUpsellCard: React.FC<PremiumUpsellCardProps> = ({ onUpgrade, variant = 'energy' }) => {
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const { title, description, Icon } = COPY[variant];

  const handleClick = () => {
    if (onUpgrade) onUpgrade();
    else setPaywallOpen(true);
  };

  return (
    <>
      <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {title}
                  <Badge variant="secondary" className="text-[10px]">PREMIUM</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {description}
                  <span className="block mt-1 text-foreground/80">
                    One subscription unlocks all 25+ professional-grade commodities across every group.
                  </span>
                  <span className="block mt-1 font-medium text-foreground">
                    $19.99/mo or $149/yr — save ~38% annually
                  </span>
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleClick} className="flex-shrink-0">
              <Lock className="w-3.5 h-3.5" />
              Upgrade to Premium
            </Button>
          </div>
        </CardHeader>
      </Card>
      <PremiumPaywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
};

export default PremiumUpsellCard;
