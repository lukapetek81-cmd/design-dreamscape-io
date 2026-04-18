import React from 'react';
import { Lock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PREMIUM_ITEMS = [
  { group: 'Regional Crude', items: ['WTI Midland', 'ANS', 'Mars', 'Louisiana Light Sweet'] },
  { group: 'Refined Products', items: ['Gasoline RBOB', 'Heating Oil', 'Jet Fuel', 'ULSD', 'Gasoil', 'Naphtha', 'Propane', 'Ethanol'] },
  { group: 'Marine Fuels', items: ['VLSFO (Rotterdam)', 'VLSFO (Singapore)', 'HFO', 'MGO'] },
];

interface PremiumUpsellCardProps {
  onUpgrade?: () => void;
}

const PremiumUpsellCard: React.FC<PremiumUpsellCardProps> = ({ onUpgrade }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
      <CardHeader className="pb-3">
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
                Regional crude blends, refined products, and marine bunker fuels
              </CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={onUpgrade} className="flex-shrink-0">
            <Lock className="w-3.5 h-3.5" />
            Upgrade
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide' : 'Show'} locked commodities
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {PREMIUM_ITEMS.map(({ group, items }) => (
              <div key={group}>
                <p className="text-xs font-semibold text-foreground mb-1.5">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="text-xs font-normal text-muted-foreground border-dashed"
                    >
                      <Lock className="w-2.5 h-2.5 mr-1 opacity-60" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumUpsellCard;
