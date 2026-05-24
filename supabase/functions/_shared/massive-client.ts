// Massive Futures Basic client (free tier).
// Docs: https://massive.com/docs/rest/futures
// Auth: Authorization: Bearer ${MASSIVE_API_KEY}
// Limits (Futures Basic): 5 req/min, EOD only, 2y history.
// We stay well under by caching the curve for 6h in the edge worker.

const BASE = 'https://api.massive.com';

function key(): string {
  return Deno.env.get('MASSIVE_API_KEY') || '';
}

async function get(path: string, params: Record<string, string | number | boolean> = {}) {
  const k = key();
  if (!k) return null;
  const qs = new URLSearchParams(
    Object.entries(params).map(([n, v]) => [n, String(v)]),
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${k}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface MassiveContract {
  ticker: string;             // e.g. 'CLF26'
  product_code: string;       // 'CL'
  last_trade_date: string;    // 'YYYY-MM-DD'
  first_trade_date?: string;
  days_to_maturity?: number;
  active: boolean;
}

/**
 * List active contracts for a futures product code, sorted by expiry ascending.
 * One API call.
 */
export async function listActiveContracts(
  productCode: string,
  asOfDate: string,           // 'YYYY-MM-DD'
  limit = 24,
): Promise<MassiveContract[]> {
  const json = await get('/futures/v1/contracts', {
    product_code: productCode,
    active: true,
    date: asOfDate,
    limit,
    sort: 'last_trade_date.asc',
  });
  const arr = json?.results;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((c: any) => c?.ticker && c?.last_trade_date)
    .map((c: any) => ({
      ticker: String(c.ticker),
      product_code: String(c.product_code ?? productCode),
      last_trade_date: String(c.last_trade_date),
      first_trade_date: c.first_trade_date ? String(c.first_trade_date) : undefined,
      days_to_maturity: typeof c.days_to_maturity === 'number' ? c.days_to_maturity : undefined,
      active: c.active !== false,
    }));
}

/**
 * Fetch the settlement close for a contract on a specific date.
 * Returns null if no bar exists for that date (weekends, holidays).
 */
export async function fetchContractDailyClose(
  ticker: string,
  date: string,               // 'YYYY-MM-DD'
): Promise<number | null> {
  const json = await get(`/futures/v1/aggs/${encodeURIComponent(ticker)}/range/1/day/${date}/${date}`);
  const bar = json?.results?.[0];
  const close = bar?.c ?? bar?.close;
  return typeof close === 'number' && close > 0 ? close : null;
}

/** Most recent business-day-ish date (yesterday in UTC); we'll let Massive return null if it's a holiday. */
export function yesterdayUtcDate(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/** Build a forward curve of up to N contracts for a product. Returns the date used for settlements. */
export async function fetchMassiveCurve(
  productCode: string,
  monthsAhead: number,
): Promise<{ asOf: string; curve: { symbol: string; expiry: string; monthIdx: number; price: number }[] }> {
  // Try up to 5 prior business days to find a settlement date with prices
  // (handles weekends + holidays without hard-coding a calendar).
  for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
    const d = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const asOf = d.toISOString().slice(0, 10);

    const contracts = await listActiveContracts(productCode, asOf, monthsAhead + 4);
    if (contracts.length === 0) continue;

    const slice = contracts.slice(0, monthsAhead);
    const prices = await Promise.all(slice.map((c) => fetchContractDailyClose(c.ticker, asOf)));

    const curve = slice
      .map((c, i) => ({
        symbol: c.ticker,
        expiry: c.last_trade_date.slice(0, 7),    // YYYY-MM
        monthIdx: i + 1,
        price: prices[i] as number | null,
      }))
      .filter((p): p is { symbol: string; expiry: string; monthIdx: number; price: number } =>
        typeof p.price === 'number' && p.price > 0,
      )
      .map((p) => ({ ...p, price: +p.price.toFixed(4) }));

    if (curve.length >= 3) return { asOf, curve };
  }
  return { asOf: yesterdayUtcDate(), curve: [] };
}
