import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Calculator, AlertTriangle, TrendingUp, DollarSign, Shield, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailableCommodities } from '@/hooks/useCommodityData';

interface RiskCalculation {
  positionSize: number;
  riskAmount: number;
  stopLoss: number;
  riskRewardRatio: number;
  marginRequired: number;
  maxDrawdown: number;
}

const RiskCalculator = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: commodities } = useAvailableCommodities();

  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [selectedCommodity, setSelectedCommodity] = useState('Crude Oil');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [contractSize, setContractSize] = useState('1000');
  const [marginPercentage, setMarginPercentage] = useState([10]);

  const selectedCommodityData = commodities.find(c => c.name === selectedCommodity);

  const calculations: RiskCalculation = useMemo(() => {
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

  const getRiskLevel = () => {
    const risk = riskPercentage[0];
    if (risk <= 1) return { level: 'Conservative', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' };
    if (risk <= 3) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20' };
    return { level: 'Aggressive', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-8 h-8 text-primary" />
            Risk Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Calculate position sizes and manage trading risk with advanced risk management tools
          </p>
        </div>
      </div>

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
                    {commodities.map(commodity => (
                      <SelectItem key={commodity.name} value={commodity.name}>
                        {commodity.name} - ${commodity.price.toFixed(2)}
                      </SelectItem>
                    ))}
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
                Risk Analysis
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

          {/* Trade Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trade Summary</CardTitle>
              <CardDescription>Review your calculated position before entering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Commodity</p>
                    <p className="font-semibold">{selectedCommodity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="font-semibold">${selectedCommodityData?.price.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Entry Price</p>
                    <p className="font-semibold">${entryPrice || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="font-semibold">${stopLossPrice || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Price</p>
                    <p className="font-semibold">${targetPrice || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Size</p>
                    <p className="font-semibold">{contractSize}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Max Loss</p>
                      <p className="font-bold text-red-600">${calculations.riskAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Potential Profit</p>
                      <p className="font-bold text-green-600">
                        ${(calculations.riskAmount * calculations.riskRewardRatio).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit Probability</p>
                      <p className="font-bold text-blue-600">
                        {calculations.riskRewardRatio > 2 ? 'High' : calculations.riskRewardRatio > 1 ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Risk Management Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Never risk more than 2-3% of your account on a single trade</li>
                    <li>• Maintain a minimum 1:2 risk-to-reward ratio</li>
                    <li>• Always use stop losses to limit downside risk</li>
                    <li>• Consider position correlation and diversification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!profile?.subscription_active && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade for Advanced Risk Tools</h3>
                <p className="text-muted-foreground">Get portfolio risk analysis, correlation matrices, and automated position sizing.</p>
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

export default RiskCalculator;