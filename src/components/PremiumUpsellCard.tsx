import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PremiumPaywall from '@/components/PremiumPaywall';

interface PremiumUpsellCardProps {
  onUpgrade?: () => void;
}

const PremiumUpsellCard: React.FC<PremiumUpsellCardProps> = ({ onUpgrade }) => {
  const [paywallOpen, setPaywallOpen] = React.useState(false);

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
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Unlock 20 Premium Energy Markets
                  <Badge variant="secondary" className="text-[10px]">PREMIUM</Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Regional crude blends, refined products, and marine bunker fuels.
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
