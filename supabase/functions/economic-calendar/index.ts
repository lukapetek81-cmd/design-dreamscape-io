import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map FMP event names to commodity impact categories
const getCommodityImpact = (event: string, country: string): string[] => {
  const e = event.toLowerCase();
  
  if (e.includes('non-farm') || e.includes('nonfarm') || e.includes('employment') || e.includes('jobless') || e.includes('unemployment')) {
    return ['Gold Futures', 'Crude Oil', 'Silver Futures'];
  }
  if (e.includes('cpi') || e.includes('inflation') || e.includes('consumer price')) {
    return ['Gold Futures', 'Silver Futures', 'Copper'];
  }
  if (e.includes('gdp')) {
    return ['Crude Oil', 'Copper', 'Gold Futures'];
  }
  if (e.includes('interest rate') || e.includes('fed') || e.includes('fomc') || e.includes('monetary')) {
    return ['Gold Futures', 'Silver Futures', 'Crude Oil'];
  }
  if (e.includes('pmi') || e.includes('manufacturing') || e.includes('industrial')) {
    return ['Copper', 'Crude Oil', 'Aluminum'];
  }
  if (e.includes('oil') || e.includes('petroleum') || e.includes('energy') || e.includes('opec')) {
    return ['Crude Oil', 'Brent Crude Oil', 'Natural Gas'];
  }
  if (e.includes('crop') || e.includes('agriculture') || e.includes('usda') || e.includes('farm')) {
    return ['Corn Futures', 'Wheat Futures', 'Soybean Futures'];
  }
  if (e.includes('trade balance') || e.includes('export') || e.includes('import')) {
    return ['Crude Oil', 'Gold Futures', 'Copper'];
  }
  if (e.includes('retail') || e.includes('consumer') || e.includes('spending')) {
    return ['Gold Futures', 'Crude Oil'];
  }
  if (e.includes('housing') || e.includes('building') || e.includes('construction')) {
    return ['Lumber', 'Copper'];
  }
  
  // Default based on country
  if (country === 'CN') return ['Copper', 'Iron Ore', 'Crude Oil'];
  if (country === 'JP') return ['Gold Futures', 'Crude Oil'];
  
  return ['Gold Futures', 'Crude Oil'];
};

const getImpactLevel = (impact: string | null): 'low' | 'medium' | 'high' => {
  if (!impact) return 'low';
  const i = impact.toLowerCase();
  if (i === 'high' || i === '3') return 'high';
  if (i === 'medium' || i === 'moderate' || i === '2') return 'medium';
  return 'low';
};

const getCategory = (event: string): string => {
  const e = event.toLowerCase();
  if (e.includes('employment') || e.includes('jobless') || e.includes('payroll') || e.includes('non-farm') || e.includes('unemployment')) return 'employment';
  if (e.includes('cpi') || e.includes('ppi') || e.includes('inflation') || e.includes('consumer price') || e.includes('producer price')) return 'inflation';
  if (e.includes('gdp') || e.includes('growth')) return 'gdp';
  if (e.includes('interest rate') || e.includes('fed') || e.includes('fomc') || e.includes('central bank') || e.includes('monetary') || e.includes('ecb') || e.includes('boe') || e.includes('boj')) return 'monetary';
  if (e.includes('pmi') || e.includes('manufacturing') || e.includes('industrial') || e.includes('production')) return 'manufacturing';
  if (e.includes('trade') || e.includes('export') || e.includes('import') || e.includes('balance')) return 'trade';
  if (e.includes('retail') || e.includes('consumer') || e.includes('spending') || e.includes('confidence')) return 'consumer';
  if (e.includes('housing') || e.includes('building') || e.includes('construction') || e.includes('home')) return 'housing';
  if (e.includes('oil') || e.includes('energy') || e.includes('petroleum') || e.includes('gas')) return 'energy';
  return 'other';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const fmpApiKey = Deno.env.get('FMP_API_KEY');
    if (!fmpApiKey) {
      throw new Error('FMP_API_KEY not configured');
    }

    const { from, to } = await req.json();
    
    // Default: current week (today to 7 days ahead)
    const now = new Date();
    const fromDate = from || now.toISOString().split('T')[0];
    const toDate = to || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Fetching economic calendar from ${fromDate} to ${toDate}`);

    const url = `https://financialmodelingprep.com/stable/economic-calendar?from=${fromDate}&to=${toDate}&apikey=${fmpApiKey}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`FMP economic calendar error: ${resp.status} - ${errText}`);
      throw new Error(`FMP API error: ${resp.status}`);
    }

    const rawEvents = await resp.json();
    console.log(`FMP returned ${rawEvents.length} economic events`);

    // Transform to our format
    const events = (Array.isArray(rawEvents) ? rawEvents : []).map((e: any, idx: number) => {
      const dateStr = e.date || '';
      const datePart = dateStr.split(' ')[0] || dateStr.split('T')[0] || '';
      const timePart = dateStr.includes(' ') ? dateStr.split(' ')[1]?.substring(0, 5) : 
                       dateStr.includes('T') ? dateStr.split('T')[1]?.substring(0, 5) : '';

      return {
        id: `fmp-${idx}-${datePart}`,
        title: e.event || 'Economic Event',
        description: `${e.event || ''} - ${e.country || 'Global'}`,
        date: datePart,
        time: timePart || '00:00',
        impact: getImpactLevel(e.impact),
        country: e.country || 'US',
        category: getCategory(e.event || ''),
        previous: e.previous != null ? String(e.previous) : undefined,
        forecast: e.estimate != null ? String(e.estimate) : undefined,
        actual: e.actual != null ? String(e.actual) : undefined,
        change: e.change != null ? Number(e.change) : undefined,
        changePercentage: e.changePercentage != null ? Number(e.changePercentage) : undefined,
        commodityImpact: getCommodityImpact(e.event || '', e.country || ''),
      };
    });

    // Sort by date and time
    events.sort((a: any, b: any) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return new Response(
      JSON.stringify({ events, count: events.length, from: fromDate, to: toDate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Economic calendar error:', error);
    return new Response(
      JSON.stringify({ error: error.message, events: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
