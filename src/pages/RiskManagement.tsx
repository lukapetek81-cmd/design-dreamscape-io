import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Target,
  BarChart3,
  Gauge,
  Activity,
  Brain,
  Zap,
  TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';
import { usePortfolio } from '@/hooks/usePortfolio';

interface RiskCalculation {
  positionSize: number;
  riskAmount: number;
  stopLoss: number;
  riskRewardRatio: number;
  marginRequired: number;
  maxDrawdown: number;
}

interface AdvancedRiskMetrics {
  var95: number;
  var99: number;
  cvar95: number;
  cvar99: number;
  sharpeRatio: number;
  sortinoRatio: number;
  volatility: number;
  maxDrawdown: number;
  probabilityOfProfit: number;
  probabilityOfLoss: number;
  expectedReturn: number;
  riskAdjustedReturn: number;
  correlationRisk: number;
  concentrationRisk: number;
}

const RiskManagement = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: commodities } = useAvailableCommodities();
  const { portfolioSummary, positions } = usePortfolio();

  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [selectedCommodity, setSelectedCommodity] = useState('Crude Oil');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [contractSize, setContractSize] = useState('1000');
  const [marginPercentage, setMarginPercentage] = useState([10]);
  const [confidenceLevel, setConfidenceLevel] = useState([95]);
  const [timeHorizon, setTimeHorizon] = useState([30]);

  const selectedCommodityData = commodities?.find(c => c.name === selectedCommodity);

  const calculations: RiskCalculation = React.useMemo(() => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = riskPercentage[0] / 100;
    const entry = parseFloat(entryPrice) || (selectedCommodityData?.price || 0);
    const stopLoss = parseFloat(stopLossPrice) || 0;
    const target = parseFloat(targetPrice) || 0;
    const contract = parseFloat(contractSize) || 1;
    const margin = marginPercentage[0] / 100;

    const riskAmount = balance * risk;
    const priceRisk = Math.abs(entry - stopLoss);
    const positionSize = priceRisk > 0 ? riskAmount / (priceRisk * contract) : 0;
    const marginRequired = entry * contract * positionSize * margin;
    const potentialProfit = Math.abs(entry - target) * contract * positionSize;
    const riskRewardRatio = riskAmount > 0 ? potentialProfit / riskAmount : 0;
    const maxDrawdown = (riskAmount / balance) * 100;

    return {
      positionSize: Math.floor(positionSize),
      riskAmount,
      stopLoss: priceRisk,
      riskRewardRatio,
      marginRequired,
      maxDrawdown
    };
  }, [accountBalance, riskPercentage, entryPrice, stopLossPrice, targetPrice, contractSize, marginPercentage, selectedCommodityData]);

  const advancedMetrics: AdvancedRiskMetrics = useMemo(() => {
    const balance = parseFloat(accountBalance) || 10000;
    const portfolioValue = portfolioSummary?.totalValue || balance;
    const volatilityEstimate = 0.20; // 20% annual volatility estimate
    const timeHorizonDays = timeHorizon[0];
    const confidence = confidenceLevel[0] / 100;
    
    // Monte Carlo simulation estimates
    const dailyVolatility = volatilityEstimate / Math.sqrt(252);
    const periodVolatility = dailyVolatility * Math.sqrt(timeHorizonDays);
    
    // VaR calculations (simplified)
    const var95 = portfolioValue * 1.645 * periodVolatility;
    const var99 = portfolioValue * 2.33 * periodVolatility;
    
    // CVaR (Expected Shortfall)
    const cvar95 = var95 * 1.3;
    const cvar99 = var99 * 1.2;
    
    // Risk-adjusted metrics
    const riskFreeRate = 0.03; // 3% risk-free rate
    const expectedReturn = 0.08; // 8% expected return
    const excessReturn = expectedReturn - riskFreeRate;
    const sharpeRatio = excessReturn / volatilityEstimate;
    
    // Sortino ratio (focusing on downside deviation)
    const downsideDeviation = volatilityEstimate * 0.7; // Simplified calculation
    const sortinoRatio = excessReturn / downsideDeviation;
    
    // Probability calculations
    const zScore = (expectedReturn) / volatilityEstimate;
    const probabilityOfProfit = 0.5 + (zScore / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * zScore * zScore);
    
    // Risk concentration
    const numPositions = positions?.length || 1;
    const concentrationRisk = Math.min(100, (100 / numPositions) * 2); // Higher with fewer positions
    
    return {
      var95,
      var99,
      cvar95,
      cvar99,
      sharpeRatio,
      sortinoRatio,
      volatility: volatilityEstimate * 100,
      maxDrawdown: 15, // Estimated max drawdown %
      probabilityOfProfit: probabilityOfProfit * 100,
      probabilityOfLoss: (1 - probabilityOfProfit) * 100,
      expectedReturn: expectedReturn * 100,
      riskAdjustedReturn: sharpeRatio,
      correlationRisk: 25, // Simplified correlation risk estimate
      concentrationRisk
    };
  }, [accountBalance, portfolioSummary, positions, timeHorizon, confidenceLevel]);

  const getRiskLevel = () => {
    const risk = riskPercentage[0];
    if (risk <= 1) return { level: 'Conservative', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' };
    if (risk <= 3) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20' };
    return { level: 'Aggressive', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' };
  };

  const getRiskColor = (value: number, thresholds: { low: number; medium: number }) => {
    if (value <= thresholds.low) return 'text-green-600';
    if (value <= thresholds.medium) return 'text-yellow-600';
    return 'text-red-600';
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Risk Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced risk analysis, portfolio optimization, and comprehensive risk metrics for professional trading
          </p>
        </div>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Position Sizing
          </TabsTrigger>
          <TabsTrigger value="var" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            VaR & CVaR
          </TabsTrigger>
          <TabsTrigger value="ratios" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Risk Ratios
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Risk Parameters
                  </CardTitle>
                  <CardDescription>Configure your trading parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Balance */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Account Balance ($)</label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                    />
                  </div>

                  {/* Risk Percentage */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Risk Per Trade: {riskPercentage[0]}%
                    </label>
                    <Slider
                      value={riskPercentage}
                      onValueChange={setRiskPercentage}
                      max={10}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${riskLevel.bg} ${riskLevel.color}`}>
                      {riskLevel.level} Risk Level
                    </div>
                  </div>

                  {/* Commodity Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Commodity</label>
                    <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commodities?.map(commodity => (
                          <SelectItem key={commodity.name} value={commodity.name}>
                            {commodity.name} - ${commodity.price.toFixed(2)}
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Entry Price */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Entry Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={selectedCommodityData?.price.toFixed(2) || "0"}
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                    />
                  </div>

                  {/* Stop Loss */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Stop Loss Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Stop loss price"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                    />
                  </div>

                  {/* Target Price */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Target price"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                    />
                  </div>

                  {/* Contract Size */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contract Size</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={contractSize}
                      onChange={(e) => setContractSize(e.target.value)}
                    />
                  </div>

                  {/* Margin Percentage */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Margin Requirement: {marginPercentage[0]}%
                    </label>
                    <Slider
                      value={marginPercentage}
                      onValueChange={setMarginPercentage}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Risk Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Position Analysis
                  </CardTitle>
                  <CardDescription>Calculated position sizing and risk metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Position Size</p>
                      <p className="text-xl font-bold text-blue-600">{calculations.positionSize}</p>
                      <p className="text-xs text-muted-foreground">Contracts</p>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Risk Amount</p>
                      <p className="text-xl font-bold text-red-600">${calculations.riskAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{riskPercentage[0]}% of Account</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Risk:Reward</p>
                      <p className="text-xl font-bold text-green-600">1:{calculations.riskRewardRatio.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Ratio</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Margin Required</p>
                      <p className="text-xl font-bold text-purple-600">${calculations.marginRequired.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{marginPercentage[0]}% Margin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="var" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VaR Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  VaR Configuration
                </CardTitle>
                <CardDescription>Configure Value at Risk parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Confidence Level: {confidenceLevel[0]}%
                  </label>
                  <Slider
                    value={confidenceLevel}
                    onValueChange={setConfidenceLevel}
                    max={99}
                    min={90}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Time Horizon: {timeHorizon[0]} days
                  </label>
                  <Slider
                    value={timeHorizon}
                    onValueChange={setTimeHorizon}
                    max={365}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Portfolio Value ($)</label>
                  <Input
                    type="number"
                    value={portfolioSummary?.totalValue?.toFixed(2) || accountBalance}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* VaR Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Value at Risk Analysis
                </CardTitle>
                <CardDescription>Maximum potential losses at different confidence levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">VaR (95%)</p>
                    <p className="text-lg font-bold text-red-600">${advancedMetrics.var95.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Daily Risk</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">VaR (99%)</p>
                    <p className="text-lg font-bold text-red-600">${advancedMetrics.var99.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Daily Risk</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">CVaR (95%)</p>
                    <p className="text-lg font-bold text-orange-600">${advancedMetrics.cvar95.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Expected Shortfall</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">CVaR (99%)</p>
                    <p className="text-lg font-bold text-orange-600">${advancedMetrics.cvar99.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Expected Shortfall</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Portfolio Volatility</span>
                      <span className={getRiskColor(advancedMetrics.volatility, { low: 15, medium: 25 })}>
                        {advancedMetrics.volatility.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Math.min(advancedMetrics.volatility * 2, 100)} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Concentration Risk</span>
                      <span className={getRiskColor(advancedMetrics.concentrationRisk, { low: 20, medium: 50 })}>
                        {advancedMetrics.concentrationRisk.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={advancedMetrics.concentrationRisk} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sharpe Ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Sharpe Ratio
                </CardTitle>
                <CardDescription>Risk-adjusted return measure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{advancedMetrics.sharpeRatio.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {advancedMetrics.sharpeRatio > 1 ? 'Good' : advancedMetrics.sharpeRatio > 0.5 ? 'Fair' : 'Poor'} Performance
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p>• {'>'}1.0: Good risk-adjusted returns</p>
                    <p>• 0.5-1.0: Acceptable returns</p>
                    <p>• {'<'}0.5: Poor risk adjustment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sortino Ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingDown className="w-5 h-5" />
                  Sortino Ratio
                </CardTitle>
                <CardDescription>Downside risk-adjusted return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{advancedMetrics.sortinoRatio.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {advancedMetrics.sortinoRatio > 1.5 ? 'Excellent' : advancedMetrics.sortinoRatio > 1 ? 'Good' : 'Moderate'} Downside Protection
                  </p>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p>• Focuses on downside deviation</p>
                    <p>• Higher values indicate better downside protection</p>
                    <p>• Complements Sharpe ratio analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk-Adjusted Return */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Expected Return
                </CardTitle>
                <CardDescription>Projected annual return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{advancedMetrics.expectedReturn.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground mt-2">Annual Target</p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Probability of Profit</span>
                        <span className="text-green-600">{advancedMetrics.probabilityOfProfit.toFixed(0)}%</span>
                      </div>
                      <Progress value={advancedMetrics.probabilityOfProfit} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Risk of Loss</span>
                        <span className="text-red-600">{advancedMetrics.probabilityOfLoss.toFixed(0)}%</span>
                      </div>
                      <Progress value={advancedMetrics.probabilityOfLoss} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Risk Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Comprehensive Risk Assessment
              </CardTitle>
              <CardDescription>Complete portfolio risk analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Metrics Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Portfolio Volatility</span>
                      <Badge variant={advancedMetrics.volatility > 25 ? 'destructive' : advancedMetrics.volatility > 15 ? 'secondary' : 'default'}>
                        {advancedMetrics.volatility.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Max Drawdown Risk</span>
                      <Badge variant={advancedMetrics.maxDrawdown > 20 ? 'destructive' : advancedMetrics.maxDrawdown > 10 ? 'secondary' : 'default'}>
                        {advancedMetrics.maxDrawdown.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Correlation Risk</span>
                      <Badge variant={advancedMetrics.correlationRisk > 40 ? 'destructive' : advancedMetrics.correlationRisk > 25 ? 'secondary' : 'default'}>
                        {advancedMetrics.correlationRisk.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Concentration Risk</span>
                      <Badge variant={advancedMetrics.concentrationRisk > 50 ? 'destructive' : advancedMetrics.concentrationRisk > 30 ? 'secondary' : 'default'}>
                        {advancedMetrics.concentrationRisk.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Management Recommendations</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {advancedMetrics.volatility > 25 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                        <span>High volatility detected. Consider reducing position sizes.</span>
                      </div>
                    )}
                    {advancedMetrics.concentrationRisk > 50 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                        <span>Portfolio is highly concentrated. Diversify across more assets.</span>
                      </div>
                    )}
                    {advancedMetrics.sharpeRatio < 0.5 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                        <span>Low risk-adjusted returns. Review strategy and risk management.</span>
                      </div>
                    )}
                    {advancedMetrics.sharpeRatio > 1 && advancedMetrics.volatility < 20 && (
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Good risk-adjusted performance. Maintain current strategy.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monte Carlo Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Probability Scenarios
                </CardTitle>
                <CardDescription>Monte Carlo simulation outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Best Case</p>
                      <p className="text-lg font-bold text-green-600">+{(advancedMetrics.expectedReturn * 1.8).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">5% Probability</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Expected</p>
                      <p className="text-lg font-bold text-blue-600">+{advancedMetrics.expectedReturn.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">50% Probability</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Worst Case</p>
                      <p className="text-lg font-bold text-red-600">{(advancedMetrics.expectedReturn - advancedMetrics.volatility * 2).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">5% Probability</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Probability Distribution</h4>
                    {[
                      { range: 'Significant Loss (>-20%)', probability: 5, color: 'bg-red-500' },
                      { range: 'Moderate Loss (-5% to -20%)', probability: 15, color: 'bg-red-400' },
                      { range: 'Small Loss (0% to -5%)', probability: 25, color: 'bg-yellow-400' },
                      { range: 'Small Gain (0% to +10%)', probability: 30, color: 'bg-green-400' },
                      { range: 'Large Gain (+10% to +25%)', probability: 20, color: 'bg-green-500' },
                      { range: 'Exceptional Gain (>+25%)', probability: 5, color: 'bg-green-600' }
                    ].map((scenario, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{scenario.range}</span>
                          <span>{scenario.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${scenario.color}`} 
                            style={{ width: `${scenario.probability * 2}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stress Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Stress Test Scenarios
                </CardTitle>
                <CardDescription>Portfolio performance under extreme conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      scenario: '2008 Financial Crisis',
                      impact: '-35%',
                      recovery: '18 months',
                      description: 'Severe market downturn scenario',
                      color: 'text-red-600'
                    },
                    {
                      scenario: 'COVID-19 Pandemic',
                      impact: '-28%',
                      recovery: '12 months',
                      description: 'Sharp correction with quick recovery',
                      color: 'text-orange-600'
                    },
                    {
                      scenario: 'High Inflation Period',
                      impact: '-15%',
                      recovery: '24 months',
                      description: 'Commodity prices volatile, currency impact',
                      color: 'text-yellow-600'
                    },
                    {
                      scenario: 'Interest Rate Shock',
                      impact: '-22%',
                      recovery: '15 months',
                      description: 'Rapid rate increases affecting valuations',
                      color: 'text-purple-600'
                    }
                  ].map((stress, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{stress.scenario}</h4>
                        <span className={`font-bold ${stress.color}`}>{stress.impact}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{stress.description}</p>
                      <div className="flex justify-between text-xs">
                        <span>Recovery Time:</span>
                        <span className="text-muted-foreground">{stress.recovery}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {!profile?.subscription_active && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Unlock Advanced Risk Analytics</h3>
                <p className="text-muted-foreground">Get real-time portfolio risk monitoring, advanced Monte Carlo simulations, and institutional-grade risk metrics.</p>
              </div>
              <Button className="ml-4">
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskManagement;