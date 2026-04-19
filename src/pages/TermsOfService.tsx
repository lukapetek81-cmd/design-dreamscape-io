import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle, DollarSign, Users, Gavel, Coins, Globe } from 'lucide-react';
import { TERMS_VERSION } from '@/lib/legalVersions';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Terms of Service - Commodity Hub"
        description="Terms and conditions for using Commodity Hub trading platform and services."
        keywords={["terms of service", "user agreement", "commodity trading", "legal terms"]}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-6 text-xs text-muted-foreground">
            <strong className="text-foreground">Template notice:</strong> This document is a defensible first draft.
            Review with EU counsel before enabling real-money features.
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Terms of Service
              </CardTitle>
              <CardDescription>
                Version {TERMS_VERSION}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  1. Acceptance of Terms
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By accessing and using Commodity Hub, you accept and agree to be bound by these terms.
                    Our services are intended for users who are at least 18 years old and legally capable of
                    entering into binding contracts.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  2. Synthetic Trading Service
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    Commodity Hub offers a synthetic trading feature that lets you open simulated long or short
                    positions on commodities against a virtual USDC balance. The following terms apply specifically
                    to this feature:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>The virtual USDC balance has <strong className="text-foreground">no monetary value</strong>, is not redeemable for cash, tokens, or any other asset, and is not an e-money instrument.</li>
                    <li>Positions are valued against live third-party market data; we do not guarantee the accuracy, completeness, or timeliness of that data.</li>
                    <li>Your starting balance, any P&L, and your trade history are <strong className="text-foreground">simulated only</strong>. No real funds are held, transferred, or at risk.</li>
                    <li>We may reset, adjust, or revoke virtual balances at our discretion (e.g. to prevent abuse, fix bugs, or limit gameplay impact).</li>
                    <li>Any leaderboard, ranking, or social-sharing feature is opt-in and may be discontinued without notice.</li>
                    <li>The synthetic trading service does not constitute investment, financial, tax, or legal advice and does not create a client relationship under MiFID II or MiCA.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  3. Future Real-Asset Features
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    We may, in a future release, allow eligible users to deposit and withdraw real USDC to back their
                    positions. Any such functionality will be subject to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Mandatory identity verification (KYC) and ongoing sanctions screening.</li>
                    <li>A separate set of terms governing real-money features, presented to you at that time and requiring fresh acceptance before any real funds move.</li>
                    <li>Custody by a regulated third-party custody partner — not by Commodity Hub directly.</li>
                    <li>Geographic restrictions: real-asset features will initially be available only to residents of eligible EU member states.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  4. Eligibility
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>You must be at least 18 years of age.</li>
                    <li>You must not be resident in or accessing the service from any country subject to EU, UN, or OFAC sanctions (including but not limited to North Korea, Iran, Syria, Cuba, and the Crimea, Donetsk, and Luhansk regions).</li>
                    <li>You must not appear on any sanctions, terrorist-financing, or denied-persons list.</li>
                    <li>You are responsible for ensuring that your use of the service is lawful in your jurisdiction.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  5. Investment Disclaimer
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Important Notice</p>
                        <p className="text-sm mt-1">
                          Real commodity trading involves substantial risk of loss and is not suitable for all
                          investors. Past performance does not predict future results. See the{' '}
                          <a href="/risk-disclosure" className="text-primary hover:underline">Risk Disclosure</a>{' '}
                          for full details on the synthetic-trading service.
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                    <li>We provide information and tools, not investment advice</li>
                    <li>All decisions you make outside the platform are at your own risk</li>
                    <li>Consult with qualified financial advisors before trading real markets</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  6. Acceptable Use
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Attempt to gain unauthorized access to our systems or another user's account</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Use automated systems, scrapers, or bots to access the service or trade synthetically without permission</li>
                    <li>Share your account credentials with others</li>
                    <li>Manipulate the synthetic balance, leaderboard, or trading mechanics through fraud, exploitation of bugs, or coordinated abuse</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Data Accuracy</h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    While we strive to provide accurate and up-to-date market data, we cannot guarantee the
                    accuracy, completeness, or timeliness of the information provided. Market data may be delayed
                    and should not be relied upon for time-sensitive decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Subscription and Billing</h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Premium subscriptions are billed monthly or annually via the Google Play or Apple App Store.</li>
                    <li>You can cancel your subscription at any time through the relevant store.</li>
                    <li>Refunds are provided in accordance with the policy of the store you purchased through.</li>
                    <li>Prices may change with reasonable notice.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  9. Limitation of Liability
                </h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    To the maximum extent permitted by applicable law, Commodity Hub shall not be liable for any
                    indirect, incidental, special, consequential, or punitive damages, including without limitation
                    loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the
                    service or any decisions made on the basis of synthetic-trading outcomes.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground text-sm">
                  <p>
                    We reserve the right to modify these terms at any time. We will notify users of material changes
                    through the service or via email. Continued use after changes constitutes acceptance of the new
                    terms; if a change materially affects synthetic trading, we will re-prompt you to accept before
                    your next trade.
                  </p>
                </div>
              </section>

              <section className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">11. Contact Information</h2>
                <div className="text-muted-foreground text-sm">
                  <p>For questions about these Terms of Service, please contact us at:</p>
                  <p className="mt-2">
                    <strong>Commodity Hub Team</strong><br />
                    Email: <a href="mailto:support@commodityhub.com" className="text-primary hover:underline">support@commodityhub.com</a>
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
