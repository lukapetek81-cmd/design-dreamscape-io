# Persist Roll Scanner & Vol Cone Snapshots

## Problem
Today both tools rely on a 6h in-memory cache per worker. When the worker is cold, the upstream Massive call errors, or the latest session hasn't settled, users get an error screen instead of the last known good data.

## Solution
Add a small `analytics_snapshots` table that stores the most recent successful payload per (tool, key). Edge functions write on success and read on failure, so the UI always renders data with a clear "as of" label.

## Database

New migration creating one table reused by both tools (and any future analytics tool):

```sql
CREATE TABLE public.analytics_snapshots (
  kind text NOT NULL,         -- 'roll_scanner' | 'vol_cone'
  key  text NOT NULL,         -- 'all' for roll scanner, commodity id for vol cone
  payload jsonb NOT NULL,
  as_of timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, key)
);

GRANT SELECT ON public.analytics_snapshots TO authenticated;
GRANT ALL    ON public.analytics_snapshots TO service_role;

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Any Pro-gated tool already enforces tier in the edge function; table read is
-- gated by authenticated role only (payloads are non-sensitive market analytics).
CREATE POLICY "auth read snapshots" ON public.analytics_snapshots
  FOR SELECT TO authenticated USING (true);
```

Writes go through `SUPABASE_SERVICE_ROLE_KEY` from edge functions, so no insert/update policy is needed.

## Edge function changes

### `supabase/functions/massive-roll-scanner/index.ts`
1. After computing `payload`, upsert into `analytics_snapshots` with `kind='roll_scanner'`, `key='all'`.
2. Wrap the live-fetch block in try/catch. On any failure (or if `results` ends up with <3 successful products), fall back to:
   ```ts
   const { data } = await admin
     .from('analytics_snapshots')
     .select('payload, as_of')
     .eq('kind','roll_scanner').eq('key','all').maybeSingle();
   ```
   Return that payload with `stale: true` and `asOf: data.as_of`. Only return 500 if both live fetch AND snapshot lookup fail.
3. Keep the 6h in-memory cache as the fast path.

### `supabase/functions/massive-vol-cone/index.ts`
1. After computing `payload`, upsert into `analytics_snapshots` with `kind='vol_cone'`, `key=commodity`.
2. On `insufficient_history` or `fetchMassiveFrontMonthBars` error, read the snapshot for that commodity and return it with `stale: true`. Only error if no snapshot exists.

## Frontend changes

### `src/pages/RollScanner.tsx` and `src/pages/VolatilityCone.tsx`
- Read `payload.stale` and `payload.asOf` from the response.
- When `stale === true`, show a small amber banner above the table/chart: "Showing last settled session ({asOf}). Live data unavailable right now."
- No behavioural change when data is fresh.

## Out of scope
- No scheduled background refresh job — snapshots only update when a Pro user opens the tool. That's enough to keep data within 6h of the most recent visit for any active product.
- No per-user history; we only store the most recent payload per key.
