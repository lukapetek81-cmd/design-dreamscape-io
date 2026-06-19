// Scheduled warmer that keeps premium energy commodities fresh in
// `commodity_price_snapshots`, independent of whether any premium user is
// browsing. Invoked by pg_cron; auth is the project's service-role key sent
// as a Bearer token (pg_cron runs server-side so this never leaves Postgres).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/utils.ts";

const OIL_API_BASE = "https://api.oilpriceapi.com/v1";

// Same mapping as oil-price-api/index.ts. Kept inline so this function has
// zero dependency on the user-facing endpoint.
const OIL_BLEND_CODES: Record<string, string> = {
  // Refined products (all premium-gated)
  "Gasoline RBOB": "GASOLINE_RBOB_USD",
  "Heating Oil": "HEATING_OIL_USD",
  "Jet Fuel": "JET_FUEL_USD",
  "ULSD Diesel": "ULSD_DIESEL_USD",
  "Gasoil": "GASOIL_USD",
  "Naphtha": "NAPHTHA_USD",
  // Premium crude blends + gas
  "Crude Oil Dubai": "DUBAI_CRUDE_USD",
  "DME Oman Crude": "DME_OMAN_USD",
  "Murban Crude": "MURBAN_CRUDE_USD",
  "OPEC Basket": "OPEC_BASKET_USD",
  "Western Canadian Select": "WCS_CRUDE_USD",
  "WTI Midland": "WTI_MIDLAND_USD",
  "Mars Blend": "MARS_USD",
  "Louisiana Light Sweet": "LOUISIANA_LIGHT_USD",
  "Natural Gas UK": "NATURAL_GAS_GBP",
  "Dutch TTF Gas": "DUTCH_TTF_EUR",
  "Japan/Korea LNG": "JKM_LNG_USD",
};

interface OilApiResponse {
  data?: { price?: number; created_at?: string };
}

async function fetchOne(
  code: string,
  apiKey: string,
): Promise<{ price: number; ts: string } | null> {
  try {
    const r = await fetch(`${OIL_API_BASE}/prices/latest?by_code=${code}`, {
      headers: { Authorization: `Token ${apiKey}` },
    });
    if (!r.ok) {
      console.warn(`OilPriceAPI ${code} → ${r.status}`);
      await r.text();
      return null;
    }
    const j = (await r.json()) as OilApiResponse;
    const price = Number(j.data?.price);
    if (!Number.isFinite(price) || price <= 0) return null;
    return { price, ts: j.data?.created_at ?? new Date().toISOString() };
  } catch (err) {
    console.warn(`OilPriceAPI ${code} threw`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Auth: must present the project's service-role key. pg_cron passes this
  // in the Authorization header; nothing else can produce it.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!serviceKey || token !== serviceKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const apiKey = Deno.env.get("OIL_PRICE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!apiKey || !supabaseUrl) {
    return new Response(
      JSON.stringify({ error: "Missing OIL_PRICE_API_KEY or SUPABASE_URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const names = Object.keys(OIL_BLEND_CODES);
  const fetched: Array<{ name: string; price: number }> = [];

  // Throttle to stay under OilPriceAPI free-tier limits (~1 req/sec is safe).
  const CONCURRENCY = 4;
  const INTER_BATCH_DELAY_MS = 1100;
  for (let i = 0; i < names.length; i += CONCURRENCY) {
    const slice = names.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      slice.map(async (name) => {
        const code = OIL_BLEND_CODES[name];
        const got = await fetchOne(code, apiKey);
        return got ? { name, price: got.price } : null;
      }),
    );
    for (const r of results) if (r) fetched.push(r);
    if (i + CONCURRENCY < names.length) {
      await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
    }
  }

  if (fetched.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, fetched: 0, message: "No prices returned" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const today = new Date().toISOString().slice(0, 10);
  const payload = fetched.map((c) => ({
    commodity_name: c.name,
    price: c.price,
    snapshot_date: today,
  }));

  const { error } = await sb
    .from("commodity_price_snapshots")
    .upsert(payload, { onConflict: "commodity_name,snapshot_date" });

  if (error) {
    console.error("Snapshot upsert failed", error.message);
    return new Response(
      JSON.stringify({ ok: false, fetched: fetched.length, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  console.log(`warm-energy-prices: refreshed ${fetched.length}/${names.length}`);
  return new Response(
    JSON.stringify({ ok: true, fetched: fetched.length, total: names.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});