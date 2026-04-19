import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, ShieldAlert, Coins, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { RISK_DISCLOSURE_VERSION } from '@/lib/legalVersions';

const RiskDisclosure = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Risk Disclosure - Commodity Hub"
        description="Risk disclosure for the Commodity Hub synthetic trading service. Understand what synthetic trading is, what it is not, and how risk applies."
        keywords={['risk disclosure', 'synthetic trading', 'commodity hub', 'MiCA', 'EU']}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-6 text-xs text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> This document is a defensible first draft.
            Review with EU counsel before enabling real-money features.
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldAlert className="h-6 w-6 text-amber-500" />
                Risk Disclosure
              </CardTitle>
              <CardDescription>
                Version {RISK_DISCLOSURE_VERSION} · Synthetic trading service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Synthetic trading is a simulation.</p>
                    <p className="text-sm text-muted-foreground">
                      No real money is at risk in the current version of Commodity Hub. Profit and loss are calculated
                      against live commodity prices but settle against a virtual USDC balance with no monetary value.
                      Past performance of any commodity does not predict future results.
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <h2 className="text-lg font-semibold mb-3">1. What synthetic trading is</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    The synthetic trading feature lets you open simulated long or short positions on commodities using a
                    virtual USDC balance allocated to your account. Position values track live commodity prices supplied
                    by our market-data providers, and your balance moves up or down based on the difference between
                    entry and exit prices.
                  </p>
                  <p>
                    Your virtual balance, positions, and trade history are stored against your account and visible only
                    to you under our Privacy Policy.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">2. What synthetic trading is not</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>It is <strong className="text-foreground">not</strong> a contract for difference (CFD), futures contract, or any other regulated derivative.</li>
                  <li>It is <strong className="text-foreground">not</strong> a brokerage, custodial, or investment service.</li>
                  <li>It is <strong className="text-foreground">not</strong> investment, financial, tax, or legal advice.</li>
                  <li>It does <strong className="text-foreground">not</strong> create a client relationship under MiFID II or the EU Markets in Crypto-Assets Regulation (MiCA).</li>
                  <li>The virtual USDC balance is <strong className="text-foreground">not</strong> a token, claim, deposit, or e-money instrument and cannot be redeemed for value.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  3. Future real-asset features
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    We may, in a future release, allow eligible users to deposit and withdraw real USDC to back their
                    positions. When that happens, the following will apply:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>You will be required to complete identity verification (KYC) before any real-money feature is unlocked.</li>
                    <li>Real-asset features will initially be available to residents of eligible EU member states only.</li>
                    <li>Custody of any real USDC will be handled by a regulated third-party custody partner — not by Commodity Hub directly.</li>
                    <li>You will be presented with a separate set of terms specific to real-asset features and must accept them before any real funds move.</li>
                    <li>Withdrawal limits, fees, leverage, and liquidation behaviour may apply and will be disclosed at that time.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  4. Regulatory positioning
                </h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Commodity Hub is not currently registered as a Crypto-Asset Service Provider (CASP) under MiCA or as
                    an investment firm under MiFID II. The synthetic trading service operates outside the scope of those
                    regimes because no real assets are transferred, custodied, or exchanged on the platform.
                  </p>
                  <p>
                    We will register with the appropriate competent authority before any real-money feature goes live in
                    a given jurisdiction.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">5. Eligibility</h2>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>You must be at least 18 years of age.</li>
                  <li>You must not be resident in or accessing the service from any country subject to EU, UN, or OFAC sanctions.</li>
                  <li>You are responsible for ensuring your use of the service is lawful in your jurisdiction.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">6. No guarantee of data accuracy</h2>
                <p className="text-sm text-muted-foreground">
                  Live commodity prices are sourced from third-party providers and may be delayed, incomplete, or
                  inaccurate. We do not guarantee the accuracy, timeliness, or availability of market data, and
                  synthetic P&L should not be relied upon as a representation of any real-world trading outcome.
                </p>
              </section>

              <section className="border-t pt-6 text-xs text-muted-foreground">
                <p>
                  Questions about this disclosure can be sent to{' '}
                  <a href="mailto:support@commodityhub.com" className="text-primary hover:underline">support@commodityhub.com</a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RiskDisclosure;
