import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, AlertTriangle, CheckCircle, Phone, Mail } from 'lucide-react';

export const IBKRSetupGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Technology Service Provider Model
          </CardTitle>
          <CardDescription>
            Regulatory-compliant commodity trading platform powered by Interactive Brokers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This platform operates under the Technology Service Provider model, partnering with Interactive Brokers to provide regulatory-compliant commodity trading services with reduced regulatory overhead.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="default">TSP Model</Badge>
                How This Platform Works
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Technology Focus:</strong> We provide the trading interface and analytics</p>
                <p>• <strong>Regulatory Compliance:</strong> Interactive Brokers handles regulatory requirements</p>
                <p>• <strong>Cost Efficiency:</strong> 85-90% reduction in regulatory compliance costs</p>
                <p>• <strong>Market Access:</strong> Direct access to global commodity markets through IBKR</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Benefits</Badge>
                TSP Model Advantages
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• No investment firm license required for the platform</li>
                <li>• IBKR provides regulatory umbrella and compliance</li>
                <li>• Focus on technology innovation rather than regulatory overhead</li>
                <li>• Faster time-to-market for new features</li>
                <li>• Reduced capital requirements and ongoing compliance costs</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Setup</Badge>
                Getting Started
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Open an Interactive Brokers trading account</li>
                <li>• Complete IBKR's standard account verification process</li>
                <li>• Enable API access in your IBKR account settings</li>
                <li>• Connect your account using the credentials form</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Support</Badge>
                Need Help?
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>IBKR Support: +1-203-618-4000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Technical Issues: support@yourplatform.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href="https://www.interactivebrokers.com/en/accounts/open-account.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Open IBKR Account
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="default">Active</Badge>
                Current Status
              </h4>
              <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-md border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">Technology Service Provider Model Active</p>
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Platform is operating under regulatory partnership with Interactive Brokers.
                      All trading activities are subject to IBKR's regulatory oversight and compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};