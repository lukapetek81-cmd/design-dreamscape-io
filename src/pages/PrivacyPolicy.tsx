import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Privacy Policy - Commodity Hub"
        description="How Commodity Hub collects and protects your personal data."
        keywords={["privacy policy", "data protection", "GDPR", "commodity prices"]}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6" /> Privacy Policy
              </CardTitle>
              <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">What We Collect</h2>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Account info: email, display name, avatar (if you sign in)</li>
                  <li>Watchlist favorites and recently viewed commodities</li>
                  <li>Subscription status from Google Play</li>
                  <li>Anonymous usage analytics and crash reports</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">How We Use It</h2>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Provide the commodity price service</li>
                  <li>Sync your watchlist across devices</li>
                  <li>Validate your premium subscription</li>
                  <li>Improve the app via aggregated analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Data Sharing</h2>
                <p>
                  We do not sell personal data. We share only with: Supabase (hosting & auth),
                  Google Play (subscription validation), and analytics providers under strict data
                  agreements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Security</h2>
                <p>
                  Data is encrypted in transit (TLS) and at rest. Row-level security restricts
                  access so each user can only read their own data.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Your Rights (GDPR)</h2>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access and download your data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and all associated data via Settings → Delete Account</li>
                  <li>Object to or restrict processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Children</h2>
                <p>The app is not directed at children under 13 (or 16 in the EU).</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
                <p>
                  Privacy questions:{' '}
                  <a href="mailto:support@commodityhub.com" className="text-primary hover:underline">
                    support@commodityhub.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
