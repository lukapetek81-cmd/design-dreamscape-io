import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Info, ExternalLink } from 'lucide-react';

export const TSPDisclaimer: React.FC = () => {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Shield className="h-5 w-5" />
          Technology Service Provider Model
          <Badge variant="outline" className="border-blue-300 text-blue-700">TSP</Badge>
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Important information about our regulatory structure and service model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This platform operates as a Technology Service Provider in partnership with Interactive Brokers. 
            We provide the trading technology while IBKR handles regulatory compliance and executes trades.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <h4 className="font-semibold mb-1">Regulatory Structure:</h4>
            <ul className="space-y-1 pl-4">
              <li>• Interactive Brokers LLC is the registered broker-dealer</li>
              <li>• Our platform provides technology services only</li>
              <li>• All trades are executed and cleared through IBKR</li>
              <li>• IBKR provides regulatory oversight and compliance</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Your Account:</h4>
            <ul className="space-y-1 pl-4">
              <li>• Your trading account is held directly with Interactive Brokers</li>
              <li>• Account protection follows IBKR's standard policies</li>
              <li>• Our platform connects to your existing IBKR account</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Risk Disclosure:</h4>
            <ul className="space-y-1 pl-4">
              <li>• All trading involves risk of loss</li>
              <li>• Past performance does not guarantee future results</li>
              <li>• Commodity trading carries additional market risks</li>
              <li>• Please review IBKR's risk disclosures before trading</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <ExternalLink className="h-3 w-3" />
            <a 
              href="https://www.interactivebrokers.com/en/general/disclaimer.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View Interactive Brokers Risk Disclosures
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};