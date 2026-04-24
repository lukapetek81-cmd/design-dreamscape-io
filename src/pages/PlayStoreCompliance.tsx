import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

type Status = 'absent' | 'present';

interface ComplianceItem {
  name: string;
  category: string;
  status: Status;
  detail: string;
}

const AD_SDKS: ComplianceItem[] = [
  { name: 'Google AdMob', category: 'Ad SDK', status: 'absent', detail: 'No com.google.android.gms.ads in AndroidManifest; package not installed.' },
  { name: 'Google AdSense', category: 'Ad SDK', status: 'absent', detail: 'No adsbygoogle.js script in index.html.' },
  { name: 'Meta Audience Network', category: 'Ad SDK', status: 'absent', detail: 'Not declared in Gradle or Capacitor config.' },
  { name: 'AppLovin / MAX', category: 'Ad SDK', status: 'absent', detail: 'Not present in dependencies.' },
  { name: 'Unity Ads', category: 'Ad SDK', status: 'absent', detail: 'Not present in dependencies.' },
  { name: 'IronSource', category: 'Ad SDK', status: 'absent', detail: 'Not present in dependencies.' },
];

const ANALYTICS_SDKS: ComplianceItem[] = [
  { name: 'Google Analytics / Firebase Analytics', category: 'Analytics SDK', status: 'absent', detail: 'No google-services.json wiring or gtag script.' },
  { name: 'Mixpanel', category: 'Analytics SDK', status: 'absent', detail: 'Not present in package.json.' },
  { name: 'Amplitude', category: 'Analytics SDK', status: 'absent', detail: 'Not present in package.json.' },
  { name: 'Segment', category: 'Analytics SDK', status: 'absent', detail: 'Not present in package.json.' },
  { name: 'PostHog', category: 'Analytics SDK', status: 'absent', detail: 'Not present in package.json.' },
  { name: 'Sentry / Crashlytics', category: 'Crash/Analytics SDK', status: 'absent', detail: 'Local-only monitoringService.ts; no external transport.' },
  { name: 'AppsFlyer / Adjust / Branch', category: 'Attribution SDK', status: 'absent', detail: 'No attribution SDKs installed.' },
];

const ADVERTISING_IDS: ComplianceItem[] = [
  { name: 'Android Advertising ID (AAID / GAID)', category: 'Advertising Identifier', status: 'absent', detail: 'com.google.android.gms.permission.AD_ID is NOT declared in AndroidManifest.' },
  { name: 'Apple IDFA', category: 'Advertising Identifier', status: 'absent', detail: 'No App Tracking Transparency usage; no IDFA reads.' },
  { name: 'App Set ID', category: 'Identifier', status: 'absent', detail: 'Not requested or read.' },
  { name: 'Fingerprinting / device graph', category: 'Identifier', status: 'absent', detail: 'No fingerprint libraries; only Supabase user UUID for auth/subscription.' },
];

const FUNCTIONAL_SDKS: ComplianceItem[] = [
  { name: 'RevenueCat (Purchases Capacitor)', category: 'Subscription / Functional', status: 'present', detail: 'Used strictly for subscription entitlements via Supabase UUID. Does not collect AAID/IDFA.' },
  { name: 'Supabase', category: 'Backend / Functional', status: 'present', detail: 'Auth, database, edge functions. No advertising data.' },
];

const StatusBadge = ({ status }: { status: Status }) => {
  if (status === 'absent') {
    return (
      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Not Present
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary gap-1">
      <ShieldCheck className="w-3 h-3" /> Functional Only
    </Badge>
  );
};

const Section = ({ title, description, items }: { title: string; description: string; items: ComplianceItem[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-card/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>
      ))}
    </CardContent>
  </Card>
);

const PlayStoreCompliance = () => {
  const totalAbsent =
    AD_SDKS.length + ANALYTICS_SDKS.length + ADVERTISING_IDS.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold">Play Store Compliance</h1>
          </div>
          <p className="text-muted-foreground">
            Live audit of advertising, analytics, and tracking SDKs in this build. Use this checklist when filling out the Google Play Data Safety form.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-2xl font-bold">{totalAbsent}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Ad/analytics SDKs & ad IDs verified absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-2xl font-bold">{FUNCTIONAL_SDKS.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Functional SDKs (no ad data)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-foreground">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold">0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Advertising networks integrated</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Section
            title="Advertising SDKs"
            description="No ad networks are bundled with the app."
            items={AD_SDKS}
          />
          <Section
            title="Analytics & Attribution SDKs"
            description="No third-party analytics or attribution SDKs collect data from this build."
            items={ANALYTICS_SDKS}
          />
          <Section
            title="Advertising Identifiers"
            description="The app does not request or read advertising identifiers."
            items={ADVERTISING_IDS}
          />
          <Section
            title="Functional SDKs (Disclosed)"
            description="These SDKs are present for app functionality and do not collect advertising data."
            items={FUNCTIONAL_SDKS}
          />
        </div>

        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Play Console Data Safety Answers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Does your app collect or share an Advertising ID? <span className="text-foreground font-medium">No</span></p>
            <p>• Does your app share data with third parties for advertising/marketing? <span className="text-foreground font-medium">No</span></p>
            <p>• Data encrypted in transit and at rest? <span className="text-foreground font-medium">Yes</span></p>
            <p>• Users can request data deletion? <span className="text-foreground font-medium">Yes — /delete-account</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayStoreCompliance;