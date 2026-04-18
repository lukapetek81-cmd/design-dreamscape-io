import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Curated list of high-impact US economic releases tracked via FRED.
// release_id = FRED release ID, series_id = primary data series for previous/actual values.
const TRACKED_RELEASES: Array<{
  release_id: number;
  series_id: string;
  title: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  commodityImpact: string[];
  releaseTimeET: string; // typical release time (Eastern), HH:MM
}> = [
  { release_id: 50,  series_id: 'PAYEMS',     title: 'Nonfarm Payrolls',                 impact: 'high',   category: 'employment',   commodityImpact: ['Gold Futures', 'WTI Crude Oil', 'Silver Futures'], releaseTimeET: '08:30' },
  { release_id: 50,  series_id: 'UNRATE',     title: 'Unemployment Rate',                impact: 'high',   category: 'employment',   commodityImpact: ['Gold Futures', 'Silver Futures'],                  releaseTimeET: '08:30' },
  { release_id: 10,  series_id: 'CPIAUCSL',   title: 'Consumer Price Index (CPI)',       impact: 'high',   category: 'inflation',    commodityImpact: ['Gold Futures', 'Silver Futures', 'Copper'],        releaseTimeET: '08:30' },
  { release_id: 46,  series_id: 'PPIACO',     title: 'Producer Price Index (PPI)',       impact: 'medium', category: 'inflation',    commodityImpact: ['Gold Futures', 'Copper'],                          releaseTimeET: '08:30' },
  { release_id: 53,  series_id: 'GDPC1',      title: 'Real GDP',                         impact: 'high',   category: 'gdp',          commodityImpact: ['WTI Crude Oil', 'Copper', 'Gold Futures'],         releaseTimeET: '08:30' },
  { release_id: 101, series_id: 'DFF',        title: 'Federal Funds Rate (FOMC)',        impact: 'high',   category: 'monetary',     commodityImpact: ['Gold Futures', 'Silver Futures', 'WTI Crude Oil'], releaseTimeET: '14:00' },
  { release_id: 21,  series_id: 'INDPRO',     title: 'Industrial Production',            impact: 'medium', category: 'manufacturing',commodityImpact: ['Copper', 'WTI Crude Oil', 'Aluminum'],             releaseTimeET: '09:15' },
  { release_id: 24,  series_id: 'RSAFS',      title: 'Retail Sales',                     impact: 'medium', category: 'consumer',     commodityImpact: ['Gold Futures', 'WTI Crude Oil'],                   releaseTimeET: '08:30' },
  { release_id: 17,  series_id: 'HOUST',      title: 'Housing Starts',                   impact: 'medium', category: 'housing',      commodityImpact: ['Lumber', 'Copper'],                                releaseTimeET: '08:30' },
  { release_id: 175, series_id: 'UMCSENT',    title: 'Consumer Sentiment (U. Michigan)', impact: 'medium', category: 'consumer',     commodityImpact: ['Gold Futures'],                                    releaseTimeET: '10:00' },
  { release_id: 13,  series_id: 'BOPGSTB',    title: 'Trade Balance',                    impact: 'medium', category: 'trade',        commodityImpact: ['WTI Crude Oil', 'Copper', 'Gold Futures'],         releaseTimeET: '08:30' },
  { release_id: 215, series_id: 'WCESTUS1',   title: 'EIA Crude Oil Inventories',        impact: 'high',   category: 'energy',       commodityImpact: ['WTI Crude Oil', 'Brent Crude Oil'],                releaseTimeET: '10:30' },
  { release_id: 215, series_id: 'WGTSTUS1',   title: 'EIA Natural Gas Storage',          impact: 'medium', category: 'energy',       commodityImpact: ['Natural Gas'],                                     releaseTimeET: '10:30' },
];

interface FredReleaseDate {
  release_id: number;
  release_name: string;
  date: string; // YYYY-MM-DD
}

interface FredObservation {
  date: string;
  value: string;
}

async function fetchReleaseDates(apiKey: string, fromDate: string, toDate: string): Promise<FredReleaseDate[]> {
  const url = `https://api.stlouisfed.org/fred/releases/dates?api_key=${apiKey}&file_type=json` +
    `&realtime_start=${fromDate}&realtime_end=${toDate}` +
    `&include_release_dates_with_no_data=true&sort_order=asc&limit=1000`;

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    console.error(`FRED releases/dates error: ${res.status} - ${errText}`);
    throw new Error(`FRED API error: ${res.status}`);
  }
  const data = await res.json();
  return data.release_dates || [];
}

async function fetchLastTwoObservations(apiKey: string, seriesId: string): Promise<FredObservation[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}` +
    `&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.observations || [];
  } catch (err) {
    console.warn(`Failed to fetch observations for ${seriesId}:`, err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const fredApiKey = Deno.env.get('FRED_API_KEY');
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY not configured');
    }

    let body: { from?: string; to?: string } = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    const now = new Date();
    const fromDate = body.from || now.toISOString().split('T')[0];
    const toDate = body.to || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`[FRED] Fetching economic calendar from ${fromDate} to ${toDate}`);

    // 1. Pull all release dates in window
    const releaseDates = await fetchReleaseDates(fredApiKey, fromDate, toDate);
    console.log(`[FRED] Got ${releaseDates.length} release dates in window`);

    // 2. Pre-fetch latest observations for each tracked series (parallel, dedup by series_id)
    const uniqueSeries = Array.from(new Set(TRACKED_RELEASES.map(r => r.series_id)));
    const observationsMap = new Map<string, FredObservation[]>();
    await Promise.all(
      uniqueSeries.map(async (seriesId) => {
        const obs = await fetchLastTwoObservations(fredApiKey, seriesId);
        observationsMap.set(seriesId, obs);
      })
    );

    // 3. Cross-reference: for each tracked release, find its scheduled dates in the window
    const events: any[] = [];
    const today = now.toISOString().split('T')[0];

    for (const tracked of TRACKED_RELEASES) {
      const matchingDates = releaseDates.filter(rd => rd.release_id === tracked.release_id);
      const obs = observationsMap.get(tracked.series_id) || [];

      // "actual" = most recent observation if its date is in the past (already released)
      // "previous" = the one before
      const latestObs = obs[0];
      const priorObs = obs[1];

      for (const rd of matchingDates) {
        const isFuture = rd.date >= today;
        const previous = priorObs?.value && priorObs.value !== '.' ? priorObs.value : undefined;
        const actual = !isFuture && latestObs?.value && latestObs.value !== '.' ? latestObs.value : undefined;

        events.push({
          id: `fred-${tracked.release_id}-${tracked.series_id}-${rd.date}`,
          title: tracked.title,
          description: `${tracked.title} - United States (FRED Release: ${rd.release_name})`,
          date: rd.date,
          time: tracked.releaseTimeET,
          impact: tracked.impact,
          country: 'US',
          category: tracked.category,
          previous,
          forecast: undefined, // FRED does not provide consensus forecasts
          actual,
          change: undefined,
          changePercentage: undefined,
          commodityImpact: tracked.commodityImpact,
        });
      }
    }

    // Sort by date then time
    events.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    console.log(`[FRED] Returning ${events.length} enriched events`);

    return new Response(
      JSON.stringify({
        events,
        count: events.length,
        from: fromDate,
        to: toDate,
        source: 'FRED (Federal Reserve Economic Data)',
        note: 'Forecast/consensus values are not available from FRED. Showing scheduled releases with previous and actual values.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Economic calendar error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message, events: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
