import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';
import { BloFinCredentialsForm } from '@/components/blofin/BloFinCredentialsForm';
import { BloFinDashboard } from '@/components/blofin/BloFinDashboard';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Trading: React.FC = () => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  if (isGuest) {
    return (
      <>
        <SEOHead
          title="Trading Dashboard - Sign In Required"
          description="Crypto futures trading dashboard with BloFin integration. Sign in to access trading features."
          keywords={["BloFin trading", "crypto futures", "commodity trading"]}
        />
        <div className="min-h-screen bg-background p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>Please sign in to access the trading dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sign in to access crypto futures trading with BloFin integration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="BloFin Trading Dashboard"
        description="Crypto futures trading with BloFin integration. Trade BTC, ETH and 200+ contracts."
        keywords={["BloFin", "crypto futures", "trading dashboard"]}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">BloFin Trading</h1>
              <p className="text-muted-foreground">
                Crypto futures trading — 200+ contracts
              </p>
            </div>
          </div>

          <BloFinCredentialsForm />
          <BloFinDashboard />
        </div>
      </div>
    </>
  );
};

export default Trading;
