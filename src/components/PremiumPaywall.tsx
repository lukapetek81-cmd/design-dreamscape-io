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
import { monitoringService } from '@/services/monitoringService';
import ManageSubscriptionButton from '@/components/ManageSubscriptionButton';
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
  'Regional crude blends (WCS, WTI Midland, Mars, LLS, Dubai, Murban)',
  'Refined products: RBOB, Heating Oil, Jet Fuel, ULSD, Gasoil, Naphtha',
  'Gas hubs: UK NBP, Dutch TTF, JKM LNG',
  'Industrial & specialty metals: Aluminum, Zinc, Iron Ore, Nickel, HRC Steel, Lithium…',
  'Grain, soft and dairy benchmarks used by procurement teams',
  'Transparent LIVE / EOD / REF sourcing label on every market',
];

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.commodityhub.app';

const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const auth = useAuth();
  const { isNative } = usePlatform();
  const [offering, setOffering] = React.useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [purchasing, setPurchasing] = React.useState<string | null>(null);
  const isPremium = Boolean(auth?.isPremium);

  React.useEffect(() => {
    if (!open) return;
    monitoringService.trackUserEvent('paywall_viewed', {
      is_native: isNative,
      is_premium: isPremium,
    });
  }, [open, isNative, isPremium]);

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
            Procurement-grade benchmarks across energy, metals, grains, softs and dairy — with transparent live / end-of-day sourcing on every market.
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

        {isPremium ? (
          <div className="space-y-3">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
              You're already a Premium subscriber — thanks for supporting Commodity Hub.
            </div>
            <ManageSubscriptionButton className="w-full" variant="default" size="default" />
          </div>
        ) : !isNative ? (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Premium subscriptions are currently only available in the Android app. Web subscriptions are coming based on user feedback.
            </div>
            <Button
              className="w-full"
              onClick={() =>
                window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer')
              }
            >
              Get the Android app
            </Button>
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
