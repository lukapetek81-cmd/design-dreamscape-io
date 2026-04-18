import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PremiumUpsellCardProps {
  onUpgrade?: () => void;
}

const PremiumUpsellCard: React.FC<PremiumUpsellCardProps> = ({ onUpgrade }) => {
  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Unlock 16 Premium Energy Markets
                <Badge variant="secondary" className="text-[10px]">PREMIUM</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Unlock additional regional crude blends, refined products, and marine bunker fuels with a Premium subscription.
              </CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={onUpgrade} className="flex-shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Upgrade to Premium
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

export default PremiumUpsellCard;
