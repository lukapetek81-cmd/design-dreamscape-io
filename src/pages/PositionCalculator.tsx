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
import { useAvailableCommodities } from '@/hooks/useCommodityData';

// Commodity registry: native price unit + conversions to other common units.
// `unit` is the unit the user enters Entry/Stop in. `equivalents` lets the
// calculator translate the resulting position size into other practical units.
type CommodityDef = {
  label: string;
  unit: string;                 // e.g. "barrel", "bushel", "troy oz", "lb", "MMBtu"
  equivalents?: { label: string; factor: number }[]; // 1 native unit = factor × label
  futuresSymbol?: keyof typeof CONTRACTS; // optional link to futures contract
  spotCommodity?: string;       // commodity name as exposed by useAvailableCommodities()
};

const COMMODITIES: Record<string, CommodityDef> = {
  CRUDE:    { label: 'Crude Oil (WTI/Brent)', unit: 'barrel',   equivalents: [{ label: 'gallons (US)', factor: 42 }, { label: 'liters', factor: 158.987 }], futuresSymbol: 'CL', spotCommodity: 'WTI Crude Oil' },
  NATGAS:   { label: 'Natural Gas',           unit: 'MMBtu',    equivalents: [{ label: 'therms', factor: 10 }],                                            futuresSymbol: 'NG', spotCommodity: 'Natural Gas' },
  GASOLINE: { label: 'Gasoline (RBOB)',       unit: 'gallon',   equivalents: [{ label: 'liters', factor: 3.78541 }, { label: 'barrels', factor: 1/42 }], spotCommodity: 'Gasoline RBOB' },
  HEATOIL:  { label: 'Heating Oil',           unit: 'gallon',   equivalents: [{ label: 'liters', factor: 3.78541 }, { label: 'barrels', factor: 1/42 }], spotCommodity: 'Heating Oil' },
  GOLD:     { label: 'Gold',                  unit: 'troy oz',  equivalents: [{ label: 'grams', factor: 31.1035 }, { label: 'kg', factor: 0.0311035 }],  futuresSymbol: 'GC', spotCommodity: 'Gold Futures' },
  SILVER:   { label: 'Silver',                unit: 'troy oz',  equivalents: [{ label: 'grams', factor: 31.1035 }, { label: 'kg', factor: 0.0311035 }],  futuresSymbol: 'SI', spotCommodity: 'Silver Futures' },
  PLATINUM: { label: 'Platinum',              unit: 'troy oz',  equivalents: [{ label: 'grams', factor: 31.1035 }, { label: 'kg', factor: 0.0311035 }], spotCommodity: 'Platinum' },
  COPPER:   { label: 'Copper',                unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'metric tons', factor: 0.000453592 }], futuresSymbol: 'HG', spotCommodity: 'Copper' },
  CORN:     { label: 'Corn',                  unit: 'bushel',   equivalents: [{ label: 'lb', factor: 56 }, { label: 'metric tons', factor: 56 * 0.000453592 }], futuresSymbol: 'ZC', spotCommodity: 'Corn Futures' },
  WHEAT:    { label: 'Wheat',                 unit: 'bushel',   equivalents: [{ label: 'lb', factor: 60 }, { label: 'metric tons', factor: 60 * 0.000453592 }], futuresSymbol: 'ZW', spotCommodity: 'Wheat Futures' },
  SOYBEAN:  { label: 'Soybeans',              unit: 'bushel',   equivalents: [{ label: 'lb', factor: 60 }, { label: 'metric tons', factor: 60 * 0.000453592 }], futuresSymbol: 'ZS', spotCommodity: 'Soybean Futures' },
  COFFEE:   { label: 'Coffee',                unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'bags (60kg)', factor: 0.453592 / 60 }], futuresSymbol: 'KC', spotCommodity: 'Coffee Arabica' },
  SUGAR:    { label: 'Sugar',                 unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'metric tons', factor: 0.000453592 }], futuresSymbol: 'SB', spotCommodity: 'Sugar #11' },
  COTTON:   { label: 'Cotton',                unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'bales (480 lb)', factor: 1 / 480 }], futuresSymbol: 'CT', spotCommodity: 'Cotton' },
  CATTLE:   { label: 'Live Cattle',           unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'cwt', factor: 0.01 }], futuresSymbol: 'LE', spotCommodity: 'Live Cattle' },
  HOGS:     { label: 'Lean Hogs',             unit: 'lb',       equivalents: [{ label: 'kg', factor: 0.453592 }, { label: 'cwt', factor: 0.01 }], futuresSymbol: 'HE', spotCommodity: 'Lean Hogs' },
  GENERIC:  { label: 'Generic / Other',       unit: 'unit' },
};

// Standard futures contract specifications.
// Margins reflect typical published values from major brokers (Interactive Brokers,
// NinjaTrader/AMP, Tradovate, TD/Schwab) as of late 2025. Exchanges and brokers
// adjust these frequently — always confirm with your broker before trading.
//   - initialMargin / maintenanceMargin: CME SPAN-based overnight margins
//     used by IBKR, TDA/Schwab Futures, etc.
//   - dayTradeMargin: typical intraday margin from day-trading brokers
//     (AMP, NinjaTrader, Tradovate, Optimus). Position must be flat by close.
const CONTRACTS: Record<string, {
  label: string;
  pointValue: number;
  tickSize: number;
  tickValue: number;
  initialMargin: number;
  maintenanceMargin: number;
  dayTradeMargin: number;
}> = {
  CL:  { label: 'Crude Oil (CL)',         pointValue: 1000,  tickSize: 0.01,  tickValue: 10,    initialMargin: 6820,  maintenanceMargin: 6200,  dayTradeMargin: 500  },
  MCL: { label: 'Micro Crude Oil (MCL)',  pointValue: 100,   tickSize: 0.01,  tickValue: 1,     initialMargin: 682,   maintenanceMargin: 620,   dayTradeMargin: 50   },
  NG:  { label: 'Natural Gas (NG)',       pointValue: 10000, tickSize: 0.001, tickValue: 10,    initialMargin: 3300,  maintenanceMargin: 3000,  dayTradeMargin: 500  },
  GC:  { label: 'Gold (GC)',              pointValue: 100,   tickSize: 0.10,  tickValue: 10,    initialMargin: 16500, maintenanceMargin: 15000, dayTradeMargin: 1000 },
  MGC: { label: 'Micro Gold (MGC)',       pointValue: 10,    tickSize: 0.10,  tickValue: 1,     initialMargin: 1650,  maintenanceMargin: 1500,  dayTradeMargin: 100  },
  SI:  { label: 'Silver (SI)',            pointValue: 5000,  tickSize: 0.005, tickValue: 25,    initialMargin: 17050, maintenanceMargin: 15500, dayTradeMargin: 2000 },
  HG:  { label: 'Copper (HG)',            pointValue: 25000, tickSize: 0.0005,tickValue: 12.5,  initialMargin: 7150,  maintenanceMargin: 6500,  dayTradeMargin: 750  },
  ZC:  { label: 'Corn (ZC)',              pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,  initialMargin: 1650,  maintenanceMargin: 1500,  dayTradeMargin: 300  },
  ZW:  { label: 'Wheat (ZW)',             pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,  initialMargin: 2200,  maintenanceMargin: 2000,  dayTradeMargin: 400  },
  ZS:  { label: 'Soybeans (ZS)',          pointValue: 50,    tickSize: 0.25,  tickValue: 12.5,  initialMargin: 3300,  maintenanceMargin: 3000,  dayTradeMargin: 500  },
  KC:  { label: 'Coffee (KC)',            pointValue: 375,   tickSize: 0.05,  tickValue: 18.75, initialMargin: 15400, maintenanceMargin: 14000, dayTradeMargin: 1500 },
  SB:  { label: 'Sugar (SB)',             pointValue: 1120,  tickSize: 0.01,  tickValue: 11.2,  initialMargin: 1540,  maintenanceMargin: 1400,  dayTradeMargin: 400  },
  CT:  { label: 'Cotton (CT)',            pointValue: 500,   tickSize: 0.01,  tickValue: 5,     initialMargin: 3300,  maintenanceMargin: 3000,  dayTradeMargin: 750  },
  LE:  { label: 'Live Cattle (LE)',       pointValue: 400,   tickSize: 0.025, tickValue: 10,    initialMargin: 2640,  maintenanceMargin: 2400,  dayTradeMargin: 400  },
  HE:  { label: 'Lean Hogs (HE)',         pointValue: 400,   tickSize: 0.025, tickValue: 10,    initialMargin: 2200,  maintenanceMargin: 2000,  dayTradeMargin: 400  },
};

const fmtUsd = (n: number) =>
  isFinite(n)
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
    : '—';

const PositionCalculator: React.FC = () => {
  const navigate = useNavigate();

  // Live spot prices for autofill of Entry fields.
  const { data: liveCommodities } = useAvailableCommodities({ lightweight: true });
  const spotPrices = useMemo(() => {
    const map: Record<string, number> = {};
    (liveCommodities ?? []).forEach((c) => { map[c.name] = c.price; });
    return map;
  }, [liveCommodities]);

  // Selected commodity for unit-aware dollar-risk sizing
  const [commodityKey, setCommodityKey] = useState<keyof typeof COMMODITIES>('CRUDE');
  const commodity = COMMODITIES[commodityKey];

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

  // When the user picks a commodity that maps to a futures contract,
  // mirror that selection in the Futures tab for seamless cross-tab flow.
  React.useEffect(() => {
    if (commodity.futuresSymbol) setSymbol(commodity.futuresSymbol);
  }, [commodityKey, commodity.futuresSymbol]);

  // Autofill Dollar-Risk Entry/Stop when commodity changes (or when spot prices arrive).
  React.useEffect(() => {
    if (!commodity.spotCommodity) return;
    const spot = spotPrices[commodity.spotCommodity];
    if (!spot || !isFinite(spot) || spot <= 0) return;
    setEntry(spot.toFixed(spot < 5 ? 4 : 2));
    setStop((spot * 0.975).toFixed(spot < 5 ? 4 : 2)); // default -2.5% stop
  }, [commodityKey, commodity.spotCommodity, spotPrices]);

  // Autofill Futures Entry/Stop when contract symbol changes (or when spot prices arrive).
  React.useEffect(() => {
    const match = Object.values(COMMODITIES).find((c) => c.futuresSymbol === symbol);
    if (!match?.spotCommodity) return;
    const spot = spotPrices[match.spotCommodity];
    if (!spot || !isFinite(spot) || spot <= 0) return;
    setFutEntry(spot.toFixed(spot < 5 ? 4 : 2));
    setFutStop((spot * 0.975).toFixed(spot < 5 ? 4 : 2));
  }, [symbol, spotPrices]);

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
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Commodity</Label>
                      <Select value={commodityKey} onValueChange={(v) => setCommodityKey(v as keyof typeof COMMODITIES)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMMODITIES).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{`${v.label} — $/${v.unit}`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Prices below are interpreted as USD per {commodity.unit}.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acct">Account Size (USD)</Label>
                      <Input id="acct" type="number" inputMode="decimal" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk">Risk per Trade (%)</Label>
                      <Input id="risk" type="number" inputMode="decimal" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entry">Entry Price (USD/{commodity.unit})</Label>
                      <Input id="entry" type="number" inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stop">Stop-Loss Price (USD/{commodity.unit})</Label>
                      <Input id="stop" type="number" inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                    <Row label="Risk amount" value={fmtUsd(dollar.riskAmount)} />
                    <Row label={`Risk per ${commodity.unit}`} value={fmtUsd(dollar.perUnitRisk)} />
                    <Row label={`Position size (${commodity.unit})`} value={dollar.units.toLocaleString(undefined, { maximumFractionDigits: 4 })} />
                    {commodity.equivalents?.map((eq) => (
                      <Row
                        key={eq.label}
                        label={`= in ${eq.label}`}
                        value={(dollar.units * eq.factor).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      />
                    ))}
                    <Row label="Position value" value={fmtUsd(dollar.positionValue)} highlight />
                    {commodity.futuresSymbol && (
                      <Row
                        label={`≈ ${CONTRACTS[commodity.futuresSymbol].label} contracts`}
                        value={(() => {
                          const spec = CONTRACTS[commodity.futuresSymbol!];
                          const e = parseFloat(entry) || 0;
                          const s = parseFloat(stop) || 0;
                          const ticks = spec.tickSize > 0 ? Math.abs(e - s) / spec.tickSize : 0;
                          const riskPerContract = ticks * spec.tickValue;
                          if (riskPerContract <= 0 || dollar.riskAmount <= 0) return '0';
                          return String(Math.floor(dollar.riskAmount / riskPerContract));
                        })()}
                      />
                    )}
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
                      {(() => {
                        const match = Object.values(COMMODITIES).find((c) => c.futuresSymbol === symbol);
                        const spot = match?.spotCommodity ? spotPrices[match.spotCommodity] : undefined;
                        return spot ? (
                          <p className="text-xs text-muted-foreground">Live spot: {fmtUsd(spot)}</p>
                        ) : null;
                      })()}
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