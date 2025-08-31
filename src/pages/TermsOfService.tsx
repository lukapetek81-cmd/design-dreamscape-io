import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle, DollarSign, Users, Gavel } from 'lucide-react';

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
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Terms of Service
              </CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Acceptance of Terms
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By accessing and using Commodity Hub, you accept and agree to be bound by the terms 
                    and provision of this agreement. Our services are intended for users who are at least 
                    18 years old and legally capable of entering into binding contracts.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Investment Disclaimer
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Investment Notice</p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                          Commodity trading involves substantial risk of loss and is not suitable for all investors. 
                          Past performance is not indicative of future results.
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>We provide information and tools, not investment advice</li>
                    <li>All trading decisions are made at your own risk</li>
                    <li>Consult with qualified financial advisors before trading</li>
                    <li>Only invest what you can afford to lose</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Use of Service
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Use automated systems to access the service without permission</li>
                    <li>Share your account credentials with others</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Data Accuracy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    While we strive to provide accurate and up-to-date market data, we cannot guarantee 
                    the accuracy, completeness, or timeliness of the information provided. Market data 
                    may be delayed and should not be relied upon for time-sensitive trading decisions.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Subscription and Billing</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Premium subscriptions are billed monthly or annually</li>
                    <li>You can cancel your subscription at any time</li>
                    <li>Refunds are provided in accordance with our refund policy</li>
                    <li>Prices may change with 30 days notice</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Limitation of Liability
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Commodity Hub shall not be liable for any indirect, incidental, special, consequential, 
                    or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                    or other intangible losses, resulting from your use of the service.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We reserve the right to modify these terms at any time. We will notify users of 
                    material changes via email or through the service. Continued use of the service 
                    after changes constitutes acceptance of the new terms.
                  </p>
                </div>
              </section>

              <section className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="text-muted-foreground">
                  <p>For questions about these Terms of Service, please contact us at:</p>
                  <p className="mt-2">
                    Email: legal@commodityhub.com<br />
                    Address: [Your Company Address]
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