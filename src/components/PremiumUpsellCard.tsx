import React from 'react';
import { Lock, Factory, Zap, Gem, Wheat, Coffee, Beef } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumPaywall from '@/components/PremiumPaywall';

type UpsellVariant = 'energy' | 'industrials' | 'metals' | 'grains' | 'softs' | 'livestock';

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
    title: 'Unlock 20 Premium Energy Markets',
    description: 'Regional crude blends, refined products, and marine bunker fuels.',
    Icon: Zap,
  },
  industrials: {
    title: 'Unlock 15 More Industrial Commodities',
    description: 'Rhodium, lithium-tier rare metals, plastics, fertilizers, and rare elements.',
    Icon: Factory,
  },
  metals: {
    title: 'Unlock 12 More Industrial & Specialty Metals',
    description: 'Lead, Nickel, Tin, Steel, HRC Steel, Titanium, Magnesium, Lithium, and more.',
    Icon: Gem,
  },
  grains: {
    title: 'Unlock 7 More Grain & Oil Markets',
    description: 'Canola, Sunflower Oil, Rapeseed Oil, plus Wheat, Soybeans, Oats, and Rough Rice spot.',
    Icon: Wheat,
  },
  softs: {
    title: 'Unlock 4 More Soft Commodities',
    description: 'UK Sugar No 5, Tea, Wool, and Palm Oil.',
    Icon: Coffee,
  },
  livestock: {
    title: 'Unlock 8 More Livestock & Dairy Markets',
    description: 'Feeder Cattle, Cheese, Eggs (CH/US), Salmon, Poultry, Butter, and Potato.',
    Icon: Beef,
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
                    Plus 60+ other premium commodities across all groups.
                  </span>
                  <span className="block mt-1 font-medium text-foreground">
                    $11.99/mo or $89/yr — save ~38% annually
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
