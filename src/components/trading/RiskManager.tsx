import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiskMetrics {
  portfolioValue: number;
  totalExposure: number;
  maxRisk: number;
  currentRisk: number;
  riskScore: number;
  positionRisks: PositionRisk[];
  riskWarnings: RiskWarning[];
}

interface PositionRisk {
  symbol: string;
  risk: number;
  maxRisk: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RiskWarning {
  type: 'CONCENTRATION' | 'EXPOSURE' | 'VOLATILITY' | 'MARGIN';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  symbol?: string;
}

interface RiskManagerProps {
  portfolioValue: number;
  positions: any[];
  accountInfo?: any;
  onRiskAlert?: (warning: RiskWarning) => void;
}

export const RiskManager: React.FC<RiskManagerProps> = ({
  portfolioValue,
  positions,
  accountInfo,
  onRiskAlert
}) => {
  const { toast } = useToast();
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate risk metrics
  useEffect(() => {
    calculateRiskMetrics();
  }, [portfolioValue, positions, accountInfo]);

  const calculateRiskMetrics = async () => {
    if (!positions.length || !portfolioValue) return;

    setIsCalculating(true);
    
    try {
      // Calculate total exposure
      const totalExposure = positions.reduce((sum, pos) => {
        return sum + Math.abs(pos.position * pos.marketPrice);
      }, 0);

      // Calculate individual position risks
      const positionRisks: PositionRisk[] = positions.map(pos => {
        const positionValue = Math.abs(pos.position * pos.marketPrice);
        const riskPercent = (positionValue / portfolioValue) * 100;
        
        let riskLevel: PositionRisk['riskLevel'] = 'LOW';
        if (riskPercent > 25) riskLevel = 'CRITICAL';
        else if (riskPercent > 15) riskLevel = 'HIGH';
        else if (riskPercent > 10) riskLevel = 'MEDIUM';

        return {
          symbol: pos.symbol,
          risk: riskPercent,
          maxRisk: 20, // Max 20% per position
          riskLevel
        };
      });

      // Calculate overall portfolio risk
      const maxRisk = portfolioValue * 0.02; // 2% max risk per trade
      const currentRisk = positions.reduce((sum, pos) => {
        return sum + Math.abs(pos.unrealizedPnl);
      }, 0);

      // Generate risk score (1-10, 10 being highest risk)
      const exposureRatio = totalExposure / portfolioValue;
      const concentrationRisk = Math.max(...positionRisks.map(p => p.risk));
      const leverageRisk = accountInfo ? (totalExposure / accountInfo.netLiquidation) : 1;
      
      const riskScore = Math.min(10, Math.max(1, Math.round(
        (exposureRatio * 3) + (concentrationRisk / 10) + (leverageRisk * 2)
      )));

      // Generate risk warnings
      const warnings: RiskWarning[] = [];

      // Concentration risk warnings
      positionRisks.forEach(pos => {
        if (pos.riskLevel === 'CRITICAL') {
          warnings.push({
            type: 'CONCENTRATION',
            message: `${pos.symbol} represents ${pos.risk.toFixed(1)}% of portfolio - consider reducing position`,
            severity: 'CRITICAL',
            symbol: pos.symbol
          });
        } else if (pos.riskLevel === 'HIGH') {
          warnings.push({
            type: 'CONCENTRATION',
            message: `${pos.symbol} has high concentration risk at ${pos.risk.toFixed(1)}%`,
            severity: 'WARNING',
            symbol: pos.symbol
          });
        }
      });

      // Portfolio exposure warnings
      if (exposureRatio > 1.5) {
        warnings.push({
          type: 'EXPOSURE',
          message: `Portfolio exposure is ${(exposureRatio * 100).toFixed(0)}% - consider reducing overall exposure`,
          severity: 'CRITICAL'
        });
      } else if (exposureRatio > 1.2) {
        warnings.push({
          type: 'EXPOSURE',
          message: `High portfolio exposure at ${(exposureRatio * 100).toFixed(0)}%`,
          severity: 'WARNING'
        });
      }

      // Margin warnings
      if (accountInfo && accountInfo.availableFunds < accountInfo.netLiquidation * 0.1) {
        warnings.push({
          type: 'MARGIN',
          message: 'Low available funds - margin call risk',
          severity: 'CRITICAL'
        });
      }

      const metrics: RiskMetrics = {
        portfolioValue,
        totalExposure,
        maxRisk,
        currentRisk,
        riskScore,
        positionRisks,
        riskWarnings: warnings
      };

      setRiskMetrics(metrics);

      // Alert on critical warnings
      warnings.forEach(warning => {
        if (warning.severity === 'CRITICAL') {
          onRiskAlert?.(warning);
          toast({
            title: "Critical Risk Alert",
            description: warning.message,
            variant: "destructive"
          });
        }
      });

    } catch (error) {
      console.error('Risk calculation error:', error);
      toast({
        title: "Risk Calculation Error",
        description: "Failed to calculate risk metrics",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'hsl(var(--destructive))';
    if (score >= 6) return 'hsl(var(--warning) / 0.8)';
    if (score >= 4) return 'hsl(var(--warning) / 0.6)';
    return 'hsl(var(--success))';
  };

  const getRiskLevelColor = (level: PositionRisk['riskLevel']) => {
    switch (level) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'secondary';
      case 'MEDIUM': return 'outline';
      case 'LOW': return 'default';
    }
  };

  if (!riskMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Management
          </CardTitle>
          <CardDescription>Portfolio risk analysis and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            {isCalculating ? 'Calculating risk metrics...' : 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Overview
          </CardTitle>
          <CardDescription>Current portfolio risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <Badge variant={riskMetrics.riskScore >= 7 ? 'destructive' : riskMetrics.riskScore >= 5 ? 'secondary' : 'default'}>
                  {riskMetrics.riskScore}/10
                </Badge>
              </div>
              <Progress 
                value={riskMetrics.riskScore * 10} 
                className="h-2"
                style={{ '--progress-foreground': getRiskColor(riskMetrics.riskScore) } as any}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Exposure</span>
                <span className="text-sm">{((riskMetrics.totalExposure / riskMetrics.portfolioValue) * 100).toFixed(0)}%</span>
              </div>
              <Progress 
                value={Math.min(100, (riskMetrics.totalExposure / riskMetrics.portfolioValue) * 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Unrealized Risk</span>
                <span className="text-sm text-muted-foreground">
                  ${Math.abs(riskMetrics.currentRisk).toLocaleString()}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (Math.abs(riskMetrics.currentRisk) / riskMetrics.maxRisk) * 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Warnings */}
      {riskMetrics.riskWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskMetrics.riskWarnings.map((warning, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  warning.severity === 'CRITICAL' ? 'border-destructive bg-destructive/5' :
                  warning.severity === 'WARNING' ? 'border-warning bg-warning/5' :
                  'border-muted bg-muted/5'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={warning.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                          {warning.type}
                        </Badge>
                        {warning.symbol && (
                          <Badge variant="outline">{warning.symbol}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{warning.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position Risk Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Position Risk Analysis</CardTitle>
          <CardDescription>Individual position risk breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskMetrics.positionRisks.map((pos, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{pos.symbol}</span>
                  <Badge variant={getRiskLevelColor(pos.riskLevel)}>
                    {pos.riskLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{pos.risk.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">of portfolio</div>
                  </div>
                  <div className="w-20">
                    <Progress 
                      value={Math.min(100, (pos.risk / pos.maxRisk) * 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};