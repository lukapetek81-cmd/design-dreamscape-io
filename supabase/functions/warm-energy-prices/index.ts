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
  // Carbon / Emissions futures
  "UK Carbon (UKA)": "UKA_CARBON_GBP",
  "EU Carbon (EUA)": "EUA_CARBON_EUR",
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

  // Auth: must present a known project key (anon or service role). The anon
  // key is already public, but combined with the DB-backed cooldown below
  // this is enough to keep OilPriceAPI quota safe from spam.
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || (token !== serviceKey && token !== anonKey)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const apiKey = Deno.env.get("OIL_PRICE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!apiKey || !supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing OIL_PRICE_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Cooldown guard: if the canonical refined-product row was upserted in the
  // last 25 minutes, skip. Protects OilPriceAPI quota even if the endpoint
  // is hit repeatedly by anyone holding the (public) anon key.
  try {
    const since = new Date(Date.now() - 25 * 60 * 1000).toISOString();
    const { data: recent } = await sb
      .from("commodity_price_snapshots")
      .select("commodity_name, created_at")
      .eq("commodity_name", "Gasoline RBOB")
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "cooldown" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    console.warn("Cooldown check failed (continuing)", err);
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

  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();
  const payload = fetched.map((c) => ({
    commodity_name: c.name,
    price: c.price,
    snapshot_date: today,
    // Bump created_at so the 25-minute cooldown guard above works.
    created_at: nowIso,
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