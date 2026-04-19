import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, ShieldAlert, UserX, Mail, Scale } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const links = [
  { to: '/terms-of-service', icon: FileText, title: 'Terms of Service', desc: 'User agreement, eligibility, and service terms.' },
  { to: '/privacy-policy', icon: Shield, title: 'Privacy Policy', desc: 'How we collect, use, and protect your personal data.' },
  { to: '/risk-disclosure', icon: ShieldAlert, title: 'Risk Disclosure', desc: 'What synthetic trading is, what it is not, and how risk applies.' },
  { to: '/delete-account', icon: UserX, title: 'Account Deletion', desc: 'Permanently delete your account and associated data.' },
];

const Compliance = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Compliance - Commodity Hub"
        description="Compliance and legal hub for Commodity Hub: terms, privacy, risk disclosure, and account controls."
        keywords={['compliance', 'legal', 'GDPR', 'MiCA', 'commodity hub']}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Scale className="h-6 w-6 text-primary" />
                Compliance & Legal
              </CardTitle>
              <CardDescription>
                One-click access to our legal documents and account controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="group rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-card"
                  >
                    <div className="flex items-start gap-3">
                      <l.icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary">{l.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{l.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">Data Protection Contact</p>
                    <p className="text-xs text-muted-foreground">
                      For data-protection requests (GDPR access, rectification, erasure, portability) or compliance
                      enquiries, contact{' '}
                      <a href="mailto:dpo@commodityhub.com" className="text-primary hover:underline">
                        dpo@commodityhub.com
                      </a>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Regulatory note:</strong> Commodity Hub currently provides a
                synthetic-only trading simulation. We are not registered as a CASP under MiCA or as a MiFID II investment
                firm. We will register before enabling any real-money features in a given jurisdiction.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Compliance;
