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
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            IBKR Integration Setup Required
          </CardTitle>
          <CardDescription>
            Interactive Brokers API requires proper licensing and setup for commercial use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              The current integration is for demonstration purposes only. For live trading, you need IBKR commercial licensing and proper gateway setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Step 1</Badge>
                Contact IBKR for Commercial Licensing
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone: +1-203-618-4000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email: institutional@interactivebrokers.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href="https://www.interactivebrokers.com/en/general/contact.php" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    IBKR Contact Page
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Step 2</Badge>
                Request These Services
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Commercial API License for your commodities platform</li>
                <li>• Real-time market data licensing (CME, NYMEX, ICE exchanges)</li>
                <li>• FIX Protocol access (recommended for institutional trading)</li>
                <li>• Risk management and compliance requirements</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Step 3</Badge>
                Technical Setup Required
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Dedicated server running IB Gateway or TWS</li>
                <li>• Secure network connection to IBKR</li>
                <li>• Client Portal API enabled on your gateway</li>
                <li>• SSL certificates and proper authentication</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="outline">Current</Badge>
                Demo Mode Active
              </h4>
              <div className="bg-muted/50 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Demo connection available for testing</p>
                    <p className="text-muted-foreground">
                      The integration simulates IBKR API responses for development and demonstration purposes.
                      Real trading requires the full setup above.
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