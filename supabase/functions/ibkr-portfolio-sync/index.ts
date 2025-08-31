import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { sessionId, portfolioData } = await req.json();

    // Get user from session
    const { data: sessionData } = await supabase
      .from('trading_sessions')
      .select('user_id')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .single();

    if (!sessionData) {
      throw new Error('Invalid or expired session');
    }

    const userId = sessionData.user_id;
    const snapshotDate = new Date().toISOString().split('T')[0];

    // Calculate portfolio metrics
    const netLiquidation = portfolioData.reduce((sum: number, pos: any) => 
      sum + (pos.position * pos.marketPrice), 0);
    const totalCash = portfolioData.reduce((sum: number, pos: any) => 
      sum + pos.realizedPnl, 0);
    const unrealizedPnl = portfolioData.reduce((sum: number, pos: any) => 
      sum + pos.unrealizedPnl, 0);
    const realizedPnl = portfolioData.reduce((sum: number, pos: any) => 
      sum + pos.realizedPnl, 0);

    // Store portfolio snapshot
    const { error: snapshotError } = await supabase
      .from('portfolio_snapshots')
      .upsert({
        user_id: userId,
        snapshot_date: snapshotDate,
        net_liquidation: netLiquidation,
        total_cash_value: totalCash,
        buying_power: netLiquidation * 4, // Assume 4:1 leverage
        positions: portfolioData,
        unrealized_pnl: unrealizedPnl,
        realized_pnl: realizedPnl
      }, {
        onConflict: 'user_id,snapshot_date'
      });

    if (snapshotError) throw snapshotError;

    // Calculate and store risk metrics
    await calculateRiskMetrics(supabase, userId, portfolioData, netLiquidation);

    return new Response(JSON.stringify({
      success: true,
      message: 'Portfolio synced successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PORTFOLIO-SYNC] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function calculateRiskMetrics(supabase: any, userId: string, positions: any[], portfolioValue: number) {
  try {
    const metricDate = new Date().toISOString().split('T')[0];
    
    // Calculate position concentration
    const positionConcentration = positions.map(pos => ({
      symbol: pos.symbol,
      weight: Math.abs(pos.position * pos.marketPrice) / portfolioValue
    }));

    // Calculate sector allocation (simplified)
    const sectorAllocation = {
      'Energy': positions.filter(p => ['CL', 'NG'].includes(p.symbol)).length,
      'Metals': positions.filter(p => ['GC', 'SI', 'HG'].includes(p.symbol)).length,
      'Agriculture': positions.filter(p => ['ZC', 'ZS', 'ZW'].includes(p.symbol)).length,
      'Soft Commodities': positions.filter(p => ['KC', 'SB'].includes(p.symbol)).length
    };

    // Simple risk score calculation (1-10)
    const maxConcentration = Math.max(...positionConcentration.map(p => p.weight));
    const numPositions = positions.length;
    const riskScore = Math.min(10, Math.max(1, Math.round(
      (maxConcentration * 10) + (1 / numPositions * 5) + (portfolioValue > 100000 ? 1 : 3)
    )));

    // Store risk metrics
    await supabase
      .from('risk_metrics')
      .upsert({
        user_id: userId,
        metric_date: metricDate,
        portfolio_value: portfolioValue,
        position_concentration: positionConcentration,
        sector_allocation: sectorAllocation,
        risk_score: riskScore
      }, {
        onConflict: 'user_id,metric_date'
      });

  } catch (error) {
    console.error('[RISK-METRICS] Error:', error);
  }
}