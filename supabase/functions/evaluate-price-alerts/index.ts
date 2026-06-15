// Cron-driven price alert evaluator.
// Reads all active alerts, fetches current prices via CommodityService,
// and inserts a trigger row + bumps last_triggered_at when a threshold is crossed
// (respecting per-alert cooldown).
//
// Invoked by pg_cron every 5 minutes via net.http_post (no JWT — uses service-role auth
// header internally). Public POSTs are rejected unless they carry the cron secret.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, EdgeLogger } from "../_shared/utils.ts";
import { CommodityService } from "../_shared/commodity-service.ts";
import { sendFcmToTokens } from "../_shared/fcm.ts";

interface AlertRow {
  id: string;
  user_id: string;
  commodity_name: string;
  commodity_symbol: string | null;
  condition: "above" | "below";
  target_price: number;
  cooldown_minutes: number;
  last_triggered_at: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const logger = new EdgeLogger({ functionName: "evaluate-price-alerts" });

  // Allow either: service-role key (cron internal) or matching cron secret header
  const auth = req.headers.get("authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("ALERT_EVALUATOR_SECRET");
  const xCron = req.headers.get("x-cron-secret");
  const isAuthorized =
    (serviceKey && auth === `Bearer ${serviceKey}`) ||
    (cronSecret && xCron === cronSecret);

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: alerts, error: alertErr } = await supabase
      .from("price_alerts")
      .select(
        "id, user_id, commodity_name, commodity_symbol, condition, target_price, cooldown_minutes, last_triggered_at",
      )
      .eq("is_active", true)
      .returns<AlertRow[]>();

    if (alertErr) throw alertErr;
    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ ok: true, checked: 0, fired: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svc = new CommodityService("evaluate-price-alerts");
    const commodities = await svc.fetchAllCommodities();
    const priceByName = new Map<string, number>();
    for (const c of commodities) {
      if (c?.name && typeof c?.price === "number") {
        priceByName.set(c.name.toLowerCase(), c.price);
      }
    }

    const now = Date.now();
    let fired = 0;
    let pushed = 0;

    for (const alert of alerts) {
      // Cooldown check
      if (alert.last_triggered_at) {
        const elapsed = now - new Date(alert.last_triggered_at).getTime();
        if (elapsed < alert.cooldown_minutes * 60_000) continue;
      }

      const price = priceByName.get(alert.commodity_name.toLowerCase());
      if (price === undefined) continue;

      const crossed =
        (alert.condition === "above" && price >= alert.target_price) ||
        (alert.condition === "below" && price <= alert.target_price);

      if (!crossed) continue;

      const triggeredAt = new Date().toISOString();
      const { error: insErr } = await supabase.from("price_alert_triggers").insert({
        alert_id: alert.id,
        user_id: alert.user_id,
        commodity_name: alert.commodity_name,
        condition: alert.condition,
        target_price: alert.target_price,
        triggered_price: price,
        triggered_at: triggeredAt,
      });
      if (insErr) {
        logger.error("Insert trigger failed", insErr, { alert_id: alert.id });
        continue;
      }
      await supabase
        .from("price_alerts")
        .update({ last_triggered_at: triggeredAt })
        .eq("id", alert.id);
      fired++;

      // Push notification to all this user's device tokens.
      try {
        const { data: tokens } = await supabase
          .from("device_tokens")
          .select("token")
          .eq("user_id", alert.user_id);
        const tokenList = (tokens ?? []).map((t: { token: string }) => t.token);
        if (tokenList.length > 0) {
          const direction = alert.condition === "above" ? "rose above" : "fell below";
          const result = await sendFcmToTokens(tokenList, {
            title: `${alert.commodity_name} alert`,
            body: `Price ${direction} $${alert.target_price} (now $${price.toFixed(2)})`,
            data: {
              alert_id: alert.id,
              commodity: alert.commodity_name,
              price: String(price),
              target: String(alert.target_price),
            },
          });
          pushed += result.sent;
          if (result.invalidTokens.length > 0) {
            await supabase
              .from("device_tokens")
              .delete()
              .in("token", result.invalidTokens);
          }
        }
      } catch (pushErr) {
        logger.error("Push send failed", pushErr, { alert_id: alert.id });
      }
    }

    logger.info(`Evaluated ${alerts.length} alerts, fired ${fired}, pushed ${pushed}`);
    return new Response(
      JSON.stringify({ ok: true, checked: alerts.length, fired, pushed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    logger.error("evaluate-price-alerts failed", err);
    return new Response(JSON.stringify({ error: "evaluation_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});