import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Plus, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAvailableCommodities } from "@/hooks/useCommodityData";
import {
  usePriceAlerts,
  useCreatePriceAlert,
  useToggleAlert,
  useDeleteAlert,
} from "@/hooks/usePriceAlerts";
import PremiumPaywall from "@/components/PremiumPaywall";
import { limitsFor } from "@/utils/tiers";

const PriceAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();
  const tier = auth?.tier ?? 'free';
  const isPremium = tier !== 'free';
  const { data: alerts = [], isLoading } = usePriceAlerts();
  const { data: commodities = [] } = useAvailableCommodities();
  const createAlert = useCreatePriceAlert();
  const toggleAlert = useToggleAlert();
  const deleteAlert = useDeleteAlert();

  const [open, setOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [form, setForm] = useState({
    commodity_name: "",
    condition: "above" as "above" | "below",
    target_price: "",
    cooldown_minutes: 60,
    note: "",
  });

  const activeCount = alerts.filter((a) => a.is_active).length;
  const limit = limitsFor(tier).activeAlerts;
  const atLimit = activeCount >= limit;

  const handleCreateClick = () => {
    if (atLimit && !isPremium) {
      setPaywallOpen(true);
      return;
    }
    if (atLimit) {
      toast({
        title: "Alert limit reached",
        description: `You have ${activeCount}/${limit} active alerts. Disable or delete one to add another.`,
      });
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.target_price);
    if (!form.commodity_name || !Number.isFinite(price) || price <= 0) {
      toast({
        title: "Invalid alert",
        description: "Pick a commodity and enter a positive target price.",
        variant: "destructive",
      });
      return;
    }
    const symbol =
      commodities.find((c: any) => c.name === form.commodity_name)?.symbol ?? null;
    try {
      await createAlert.mutateAsync({
        commodity_name: form.commodity_name,
        commodity_symbol: symbol,
        condition: form.condition,
        target_price: price,
        cooldown_minutes: form.cooldown_minutes,
        note: form.note || null,
      });
      toast({ title: "Alert created", description: "We'll notify you when the price crosses the threshold." });
      setOpen(false);
      setForm({ commodity_name: "", condition: "above", target_price: "", cooldown_minutes: 60, note: "" });
    } catch (err: any) {
      const msg = String(err?.message ?? "Failed to create alert");
      if (msg.includes("limit reached")) {
        setPaywallOpen(true);
      } else {
        toast({ title: "Failed to create alert", description: msg, variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard
        </Button>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Price Alerts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified when commodities cross your target price.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCount}/{limit} active alerts {isPremium ? "(Premium)" : "(Free tier)"}
            </p>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            New alert
          </Button>
        </div>

        {!isPremium && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Free tier: 1 active alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upgrade to Premium for up to 50 alerts across every commodity.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPaywallOpen(true)}>
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No alerts yet</CardTitle>
              <CardDescription>
                Set your first alert to get notified when a commodity hits a target price.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <Card key={a.id}>
                <CardContent className="pt-6 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.commodity_name}</span>
                      <Badge variant={a.condition === "above" ? "default" : "secondary"}>
                        {a.condition} ${a.target_price}
                      </Badge>
                      {!a.is_active && <Badge variant="outline">Paused</Badge>}
                    </div>
                    {a.note && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{a.note}</p>
                    )}
                    {a.last_triggered_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last triggered {new Date(a.last_triggered_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={(v) =>
                        toggleAlert.mutate(
                          { id: a.id, is_active: v },
                          {
                            onError: (err: any) => {
                              const msg = String(err?.message ?? "");
                              if (msg.includes("limit reached")) setPaywallOpen(true);
                              else toast({ title: "Update failed", description: msg, variant: "destructive" });
                            },
                          },
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert.mutate(a.id)}
                      aria-label="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New price alert</DialogTitle>
            <DialogDescription>
              We'll check prices every 5 minutes and notify you when the threshold is crossed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Commodity</Label>
              <Select
                value={form.commodity_name}
                onValueChange={(v) => setForm((f) => ({ ...f, commodity_name: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a commodity" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {commodities.map((c: any) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                      {typeof c.price === "number" ? ` (now $${c.price.toFixed(2)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={form.condition}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, condition: v as "above" | "below" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Goes above</SelectItem>
                    <SelectItem value="below">Goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.target_price}
                  onChange={(e) => setForm((f) => ({ ...f, target_price: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Re-fire cooldown (minutes)</Label>
              <Input
                type="number"
                min="5"
                step="5"
                value={form.cooldown_minutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cooldown_minutes: Math.max(5, Number(e.target.value) || 60) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Avoids notification spam if the price hovers around the threshold.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                maxLength={200}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Stop-loss level"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAlert.isPending}>
                {createAlert.isPending ? "Creating…" : "Create alert"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PremiumPaywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default PriceAlertsPage;