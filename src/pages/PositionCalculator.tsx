import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calculator } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

// Standard futures contract specifications (point value $/point, typical initial margin USD).
// Margins are indicative — exchanges/brokers update them frequently.
const CONTRACTS: Record<string, { label: string; pointValue: number; tickSize: number; tickValue: number; initialMargin: number }> = {
  CL:  { label: 'Crude Oil (CL)',         pointValue: 1000,  tickSize: 0.01,  tickValue: 10,     initialMargin: 6500 },
  MCL: { label: 'Micro Crude Oil (MCL)',  pointValue: 100,   tickSize: 0.01,  tickValue: 1,      initialMargin: 650  },
  NG:  { label: 'Natural Gas (NG)',       pointValue: 10000, tickSize: 0.001, tickValue: 10,     initialMargin: 5500 },
  GC:  { label: 'Gold (GC)',              pointValue: 100,   tickSize: 0.10,  tickValue: 10,     initialMargin: 13500 },
  MGC: { label: 'Micro Gold (MGC)',       pointValue: 10,    tickSize: 0.10,  tickValue: 1,      initialMargin: 1350  },
  SI:  { label: 'Silver (SI)',            pointValue: 5000,  tickSize: 0.005, tickValue: 25,     initialMargin: 16000 },
  HG:  { label: 'Copper (HG)',            pointValue: 25000, tickSize: 0.0005,tickValue: 12.5,   initialMargin: 7000  },
  ZC:  { label: 'Corn (ZC)',              pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,   initialMargin: 2200  },
  ZW:  { label: 'Wheat (ZW)',             pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,   initialMargin: 2800  },
  ZS:  { label: 'Soybeans (ZS)',          pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,   initialMargin: 3500  },
  KC:  { label: 'Coffee (KC)',            pointValue: 375,   tickSize: 0.05,  tickValue: 18.75,  initialMargin: 11000 },
  SB:  { label: 'Sugar (SB)',             pointValue: 1120,  tickSize: 0.01,  tickValue: 11.2,   initialMargin: 1500  },
  CT:  { label: 'Cotton (CT)',            pointValue: 500,   tickSize: 0.01,  tickValue: 5,      initialMargin: 3500  },
  LE:  { label: 'Live Cattle (LE)',       pointValue: 400,   tickSize: 0.025, tickValue: 10,     initialMargin: 2200  },
  HE:  { label: 'Lean Hogs (HE)',         pointValue: 400,   tickSize: 0.025, tickValue: 10,     initialMargin: 1800  },
};

const fmtUsd = (n: number) =>
  isFinite(n)
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '—';

const PositionCalculator: React.FC = () => {
  const navigate = useNavigate();

  // Risk-based (dollar) sizing
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPct, setRiskPct] = useState('1');
  const [entry, setEntry] = useState('80');
  const [stop, setStop] = useState('78');

  // Futures sizing
  const [symbol, setSymbol] = useState<keyof typeof CONTRACTS>('CL');
  const [contracts, setContracts] = useState('1');
  const [futEntry, setFutEntry] = useState('80');
  const [futStop, setFutStop] = useState('78');

  const dollar = useMemo(() => {
    const acct = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPct) || 0;
    const e = parseFloat(entry) || 0;
    const s = parseFloat(stop) || 0;
    const riskAmount = (acct * risk) / 100;
    const perUnitRisk = Math.abs(e - s);
    const units = perUnitRisk > 0 ? riskAmount / perUnitRisk : 0;
    const positionValue = units * e;
    return { riskAmount, perUnitRisk, units, positionValue };
  }, [accountSize, riskPct, entry, stop]);

  const fut = useMemo(() => {
    const spec = CONTRACTS[symbol];
    const n = Math.max(0, Math.floor(parseFloat(contracts) || 0));
    const e = parseFloat(futEntry) || 0;
    const s = parseFloat(futStop) || 0;
    const notional = n * spec.pointValue * e;
    const totalMargin = n * spec.initialMargin;
    const leverage = totalMargin > 0 ? notional / totalMargin : 0;
    const ticks = spec.tickSize > 0 ? Math.abs(e - s) / spec.tickSize : 0;
    const riskPerContract = ticks * spec.tickValue;
    const totalRisk = n * riskPerContract;
    return { spec, n, notional, totalMargin, leverage, riskPerContract, totalRisk };
  }, [symbol, contracts, futEntry, futStop]);

  // Suggested # of futures contracts given the dollar-risk inputs above
  const suggestedContracts = useMemo(() => {
    const spec = CONTRACTS[symbol];
    const e = parseFloat(futEntry) || 0;
    const s = parseFloat(futStop) || 0;
    const ticks = spec.tickSize > 0 ? Math.abs(e - s) / spec.tickSize : 0;
    const riskPerContract = ticks * spec.tickValue;
    if (riskPerContract <= 0 || dollar.riskAmount <= 0) return 0;
    return Math.floor(dollar.riskAmount / riskPerContract);
  }, [symbol, futEntry, futStop, dollar.riskAmount]);

  return (
    <>
      <SEOHead
        title="Position Size Calculator - Commodity Hub"
        description="Calculate position size in dollars or futures contracts with margin and risk-based sizing."
        keywords={["position size", "futures margin", "risk management", "calculator"]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl pb-[calc(3rem+env(safe-area-inset-bottom))]">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="h-6 w-6" />
                Position Size Calculator
              </CardTitle>
              <CardDescription>
                Size positions by dollar risk or futures contracts, with margin and leverage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dollar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dollar">Dollar Risk</TabsTrigger>
                  <TabsTrigger value="futures">Futures Contracts</TabsTrigger>
                </TabsList>

                <TabsContent value="dollar" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acct">Account Size (USD)</Label>
                      <Input id="acct" type="number" inputMode="decimal" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk">Risk per Trade (%)</Label>
                      <Input id="risk" type="number" inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry">Entry Price</Label>
                      <Input id="entry" type="number" inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stop">Stop-Loss Price</Label>
                      <Input id="stop" type="number" inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <Row label="Risk amount" value={fmtUsd(dollar.riskAmount)} />
                    <Row label="Risk per unit" value={fmtUsd(dollar.perUnitRisk)} />
                    <Row label="Position size (units)" value={dollar.units.toFixed(4)} />
                    <Row label="Position value" value={fmtUsd(dollar.positionValue)} highlight />
                  </div>
                </TabsContent>

                <TabsContent value="futures" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Contract</Label>
                      <Select value={symbol} onValueChange={(v) => setSymbol(v as keyof typeof CONTRACTS)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONTRACTS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="n">Number of Contracts</Label>
                      <Input id="n" type="number" inputMode="numeric" min={0} value={contracts} onChange={(e) => setContracts(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fe">Entry Price</Label>
                      <Input id="fe" type="number" inputMode="decimal" value={futEntry} onChange={(e) => setFutEntry(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fs">Stop-Loss Price</Label>
                      <Input id="fs" type="number" inputMode="decimal" value={futStop} onChange={(e) => setFutStop(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <Row label="Point value" value={fmtUsd(fut.spec.pointValue)} />
                    <Row label="Tick size / tick value" value={`${fut.spec.tickSize} / ${fmtUsd(fut.spec.tickValue)}`} />
                    <Row label="Initial margin / contract" value={fmtUsd(fut.spec.initialMargin)} />
                    <Row label="Notional value" value={fmtUsd(fut.notional)} />
                    <Row label="Total initial margin" value={fmtUsd(fut.totalMargin)} highlight />
                    <Row label="Leverage" value={`${fut.leverage.toFixed(2)}x`} />
                    <Row label="Risk per contract (to stop)" value={fmtUsd(fut.riskPerContract)} />
                    <Row label="Total risk" value={fmtUsd(fut.totalRisk)} highlight />
                    <Row
                      label="Suggested contracts (from Dollar Risk tab)"
                      value={String(suggestedContracts)}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Margin figures are indicative initial margins and change frequently. Confirm current
                    requirements with your broker before trading.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    <span className={highlight ? 'font-semibold text-foreground' : 'font-medium'}>{value}</span>
  </div>
);

export default PositionCalculator;