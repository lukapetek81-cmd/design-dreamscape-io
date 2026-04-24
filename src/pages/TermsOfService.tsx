import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Terms of Service - Commodity Hub"
        description="Terms and conditions for using Commodity Hub commodity price tracking app."
        keywords={["terms of service", "user agreement", "commodity prices"]}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" /> Terms of Service
              </CardTitle>
              <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">1. About Commodity Hub</h2>
                <p>
                  Commodity Hub is an information-only mobile and web application that displays
                  commodity market prices, charts, and related news. We are not a broker, exchange,
                  custodian, or financial advisor.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">2. No Investment Advice</h2>
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Nothing in the app constitutes investment, financial, tax, or legal advice.
                    Trading commodities involves substantial risk. Consult a licensed advisor before
                    making any investment decision.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Accuracy</h2>
                <p>
                  Prices are sourced from third-party providers and may be delayed or inaccurate.
                  We do not guarantee accuracy, completeness, or timeliness, and we are not liable
                  for decisions made based on the information shown.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">4. Premium Subscription</h2>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The free tier shows a limited set of headline commodities.</li>
                  <li>A Premium subscription unlocks the full commodity catalogue and removes ads.</li>
                  <li>Subscriptions are billed and managed by Google Play.</li>
                  <li>You can cancel at any time from your Google Play account.</li>
                  <li>Refunds follow the Google Play refund policy.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">5. Acceptable Use</h2>
                <p>
                  You agree not to scrape, redistribute, or resell market data, attempt to bypass
                  the paywall, or interfere with normal operation of the service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">6. Account & Deletion</h2>
                <p>
                  You may delete your account at any time from Settings → Delete Account. All
                  account data is permanently removed.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Commodity Hub is provided "as is" without
                  warranties. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">8. Changes</h2>
                <p>
                  We may update these terms; continued use after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">9. Contact</h2>
                <p>
                  Questions? Email{' '}
                  <a href="mailto:support@commodityhub.com" className="text-primary hover:underline">
                    support@commodityhub.com
                  </a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
