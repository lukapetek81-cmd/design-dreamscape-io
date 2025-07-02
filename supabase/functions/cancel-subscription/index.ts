import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const { subscriptionId, cancelAtPeriodEnd = true } = await req.json();
    
    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify the subscription belongs to this user
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (typeof customer === 'string' || customer.email !== user.email) {
      throw new Error("Unauthorized: Subscription does not belong to this user");
    }

    logStep("Subscription verified", { subscriptionId, customerId: customer.id });

    let updatedSubscription;
    if (cancelAtPeriodEnd) {
      // Cancel at period end (downgrade)
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      logStep("Subscription set to cancel at period end");
    } else {
      // Cancel immediately
      updatedSubscription = await stripe.subscriptions.cancel(subscriptionId);
      logStep("Subscription canceled immediately");
    }

    // Update Supabase records
    await supabaseClient.from("subscribers").update({
      subscribed: !cancelAtPeriodEnd, // false if immediate cancel, true if cancel at period end
      subscription_tier: cancelAtPeriodEnd ? 'premium' : null, // keep tier until period ends
      updated_at: new Date().toISOString(),
    }).eq('email', user.email);

    await supabaseClient.from("profiles").update({
      subscription_active: !cancelAtPeriodEnd,
      subscription_tier: cancelAtPeriodEnd ? 'premium' : 'free',
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        canceled_at: updatedSubscription.canceled_at,
        current_period_end: updatedSubscription.current_period_end,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});