import React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/hooks/usePlatform';
import {
  configureRevenueCat,
  getOfferings,
  isRevenueCatAvailable,
  purchasePackage,
  restorePurchases,
} from '@/services/revenueCat';
import type { PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface PremiumPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  'Full commodity catalogue (40+ markets)',
  'All metals, grains, softs, livestock & industrials',
  'Regional crude blends and refined products',
  'Extended price history & charts',
  'Ad-free experience',
];

const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const { isNative } = usePlatform();
  const [offering, setOffering] = React.useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [purchasing, setPurchasing] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (!isRevenueCatAvailable()) return;

    (async () => {
      setLoading(true);
      await configureRevenueCat(auth?.user?.id ?? null);
      const current = await getOfferings();
      setOffering(current);
      setLoading(false);
    })();
  }, [open, auth?.user?.id]);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(pkg.identifier);
    const result = await purchasePackage(pkg);
    setPurchasing(null);

    if (result.success) {
      toast({
        title: 'Welcome to Premium!',
        description: 'Premium energy markets are now unlocked.',
      });
      await auth?.refreshProfile();
      onOpenChange(false);
    } else if (result.error && result.error !== 'cancelled') {
      toast({
        title: 'Purchase failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const restored = await restorePurchases();
    setLoading(false);
    toast({
      title: restored ? 'Purchases restored' : 'Nothing to restore',
      description: restored
        ? 'Your premium access has been re-activated.'
        : 'No previous premium purchase found on this account.',
    });
    if (restored) {
      await auth?.refreshProfile();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          <DialogTitle>Commodity Hub Premium</DialogTitle>
            <Badge variant="secondary" className="text-[10px]">PREMIUM</Badge>
          </div>
          <DialogDescription>
            Unlock the full commodity catalogue with a single subscription.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        {!isNative ? (
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            In-app purchases are only available in the Android app. Install Commodity Hub from the Play Store to upgrade.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : offering ? (
          <div className="space-y-2">
            {offering.availablePackages.map((pkg) => (
              <Button
                key={pkg.identifier}
                onClick={() => handlePurchase(pkg)}
                disabled={purchasing !== null}
                className="w-full justify-between h-auto py-3"
                variant={pkg.packageType === 'ANNUAL' ? 'default' : 'outline'}
              >
                <span className="text-left">
                  <span className="block font-medium">
                    {pkg.packageType === 'ANNUAL' ? 'Annual' : 'Monthly'}
                  </span>
                  {pkg.packageType === 'ANNUAL' && (
                    <span className="block text-xs opacity-80">Best value · Save ~38%</span>
                  )}
                </span>
                <span className="font-semibold">
                  {purchasing === pkg.identifier ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    pkg.product.priceString
                  )}
                </span>
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="w-full" onClick={handleRestore}>
              Restore previous purchase
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Subscriptions are not available right now. Please try again later.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PremiumPaywall;
