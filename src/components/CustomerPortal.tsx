import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  Wallet, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BillingInfo {
  customer: {
    id: string;
    email: string;
    name: string;
    created: number;
  };
  subscriptions: Array<{
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
    items: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        interval: string;
      };
      quantity: number;
    }>;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string;
    created: number;
    due_date: number | null;
    hosted_invoice_url: string;
    invoice_pdf: string;
  }>;
  paymentMethods: Array<{
    id: string;
    type: string;
    card: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    } | null;
  }>;
}

const CustomerPortal = () => {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchBillingInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-billing-info');

      if (error) throw error;
      setBillingInfo(data);
    } catch (error) {
      console.error('Error fetching billing info:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = true) => {
    if (!user) return;

    try {
      setCanceling(true);
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId, cancelAtPeriodEnd },
      });

      if (error) throw error;

      toast({
        title: "Subscription Updated",
        description: cancelAtPeriodEnd 
          ? "Your subscription will cancel at the end of the current period"
          : "Your subscription has been canceled immediately",
      });

      // Refresh billing info
      await fetchBillingInfo();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, [user]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  if (!billingInfo) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No billing information found.</p>
        <Button onClick={fetchBillingInfo} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  const activeSubscription = billingInfo.subscriptions.find(sub => sub.status === 'active');

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Account Overview</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{billingInfo.customer.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer Since</p>
            <p className="font-medium">{formatDate(billingInfo.customer.created)}</p>
          </div>
        </div>
      </Card>

      {/* Password Change */}
      <PasswordChangeForm />

      {/* Current Subscription */}
      {activeSubscription && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Current Subscription</h3>
            <Badge variant={activeSubscription.cancel_at_period_end ? "destructive" : "default"}>
              {activeSubscription.cancel_at_period_end ? "Canceling" : "Active"}
            </Badge>
          </div>

          <div className="space-y-4">
            {activeSubscription.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Real-Time Data Access</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(item.price.unit_amount, item.price.currency)} per {item.price.interval}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(item.price.unit_amount * item.quantity, item.price.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Next billing date</p>
                <p className="font-medium">{formatDate(activeSubscription.current_period_end)}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={openCustomerPortal}>
                  Manage Payment Method
                </Button>
                
                {!activeSubscription.cancel_at_period_end && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={canceling}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period ({formatDate(activeSubscription.current_period_end)}).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleCancelSubscription(activeSubscription.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Methods */}
      {billingInfo.paymentMethods.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {billingInfo.paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-muted rounded flex items-center justify-center text-xs font-medium">
                    {method.card?.brand.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• {method.card?.last4}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card?.exp_month}/{method.card?.exp_year}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Default</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invoice History */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Invoice History</h3>
        </div>

        {billingInfo.invoices.length === 0 ? (
          <p className="text-muted-foreground">No invoices found.</p>
        ) : (
          <div className="space-y-3">
            {billingInfo.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-muted">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Invoice #{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.created)} • {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                  >
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerPortal;