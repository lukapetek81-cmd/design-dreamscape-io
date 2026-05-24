// Pulls the CFTC Disaggregated Futures-Only weekly report and caches a subset
// of commodities into public.cot_reports. Designed to run on a cron schedule
// every Friday evening when CFTC publishes. Idempotent via UNIQUE(commodity, report_date).
//
// Public CFTC dataset: https://publicreporting.cftc.gov/resource/72hh-3qpy.json

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders, EdgeLogger } from '../_shared/utils.ts';

// Map CFTC contract names → our display names
const COMMODITY_MAP: Record<string, string> = {
  'CRUDE OIL, LIGHT SWEET-NYMEX': 'WTI Crude Oil',
  'NAT GAS NYME': 'Natural Gas',
  'GOLD - COMMODITY EXCHANGE INC.': 'Gold',
  'SILVER - COMMODITY EXCHANGE INC.': 'Silver',
  'COPPER- #1 - COMMODITY EXCHANGE INC.': 'Copper',
  'CORN - CHICAGO BOARD OF TRADE': 'Corn',
  'WHEAT-SRW - CHICAGO BOARD OF TRADE': 'Wheat',
  'SOYBEANS - CHICAGO BOARD OF TRADE': 'Soybeans',
  'COFFEE C - ICE FUTURES U.S.': 'Coffee',
  'SUGAR NO. 11 - ICE FUTURES U.S.': 'Sugar',
  'COTTON NO. 2 - ICE FUTURES U.S.': 'Cotton',
};

interface CftcRow {
  market_and_exchange_names: string;
  report_date_as_yyyy_mm_dd: string;
  m_money_positions_long_all: string;
  m_money_positions_short_all: string;
  comm_positions_long_all: string;
  comm_positions_short_all: string;
  open_interest_all: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const logger = new EdgeLogger({ functionName: 'fetch-cot-report' });

  // Cron-only: require service-role auth header
  const auth = req.headers.get('authorization') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!serviceKey || auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Pull last 60 weeks of data, filtered to our commodity list
    const names = Object.keys(COMMODITY_MAP).map((n) => `"${n}"`).join(',');
    const query = encodeURIComponent(
      `SELECT market_and_exchange_names, report_date_as_yyyy_mm_dd, m_money_positions_long_all, m_money_positions_short_all, comm_positions_long_all, comm_positions_short_all, open_interest_all WHERE market_and_exchange_names IN (${names}) ORDER BY report_date_as_yyyy_mm_dd DESC LIMIT 1500`,
    );
    const url = `https://publicreporting.cftc.gov/resource/72hh-3qpy.json?$query=${query}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`CFTC ${resp.status}`);
    const rows: CftcRow[] = await resp.json();

    let inserted = 0;
    for (const row of rows) {
      const commodity = COMMODITY_MAP[row.market_and_exchange_names];
      if (!commodity) continue;
      const mmLong = parseInt(row.m_money_positions_long_all || '0', 10);
      const mmShort = parseInt(row.m_money_positions_short_all || '0', 10);
      const commLong = parseInt(row.comm_positions_long_all || '0', 10);
      const commShort = parseInt(row.comm_positions_short_all || '0', 10);
      const oi = parseInt(row.open_interest_all || '0', 10);
      const { error } = await supabase.from('cot_reports').upsert({
        commodity,
        report_date: row.report_date_as_yyyy_mm_dd.slice(0, 10),
        managed_money_long: mmLong,
        managed_money_short: mmShort,
        commercials_long: commLong,
        commercials_short: commShort,
        net_position: mmLong - mmShort,
        open_interest: oi,
      }, { onConflict: 'commodity,report_date', ignoreDuplicates: false });
      if (!error) inserted++;
      else logger.warn('Upsert failed', { commodity, err: error.message });
    }
    logger.info(`COT sync done: ${inserted}/${rows.length} rows`);
    return new Response(JSON.stringify({ ok: true, processed: rows.length, inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    logger.error('fetch-cot-report failed', err);
    return new Response(JSON.stringify({ error: 'fetch_failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});