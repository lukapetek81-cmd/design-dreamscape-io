import React from 'react';
import { Lock, Factory, Zap, Gem, Wheat, Coffee, Beef, Smartphone } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumPaywall from '@/components/PremiumPaywall';
import { usePlatform } from '@/hooks/usePlatform';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.commodityhub.app';

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
    title: 'Unlock 17 Premium Energy Markets',
    description: 'Regional crude blends (WCS, WTI Midland, Mars, LLS, Dubai, Murban), gas hubs (UK, Dutch TTF, JKM LNG), and refined products (RBOB, Heating Oil, Jet Fuel, ULSD, Gasoil, Naphtha).',
    Icon: Zap,
  },
  industrials: {
    title: 'Unlock 3 Premium Industrial Commodities',
    description: 'Industrial Ethanol, Rubber, and Cobalt.',
    Icon: Factory,
  },
  metals: {
    title: 'Unlock 11 More Industrial & Specialty Metals',
    description: 'Palladium, Aluminum, Zinc, Iron Ore, Lead, Nickel, Tin, Steel, HRC Steel, Titanium, and Lithium.',
    Icon: Gem,
  },
  grains: {
    title: 'Unlock 6 More Grain & Oil Markets',
    description: 'Soybean Oil, Soybean Meal, Oats, Rough Rice, Canola, and Sunflower Oil.',
    Icon: Wheat,
  },
  softs: {
    title: 'Unlock 3 More Soft Commodities',
    description: 'Orange Juice, UK Sugar No 5 (white sugar), and Palm Oil.',
    Icon: Coffee,
  },
  livestock: {
    title: 'Unlock Premium Dairy Markets',
    description: 'Class III Milk futures pricing.',
    Icon: Beef,
  },
};

const PremiumUpsellCard: React.FC<PremiumUpsellCardProps> = ({ onUpgrade, variant = 'energy' }) => {
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const { title, description, Icon } = COPY[variant];
  const { isNative } = usePlatform();

  const handleClick = () => {
    if (onUpgrade) onUpgrade();
    else if (!isNative) window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
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
                    One subscription unlocks all 40+ professional-grade premium commodities across every group.
                  </span>
                  <span className="block mt-1 font-medium text-foreground">
                    $19.99/mo or $149/yr — save ~38% annually
                  </span>
                </CardDescription>
              </div>
            </div>
            <Button size="sm" onClick={handleClick} className="flex-shrink-0">
              {isNative ? <Lock className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              {isNative ? 'Upgrade to Premium' : 'Get the Android app'}
            </Button>
          </div>
        </CardHeader>
      </Card>
      <PremiumPaywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </>
  );
};

export default PremiumUpsellCard;
