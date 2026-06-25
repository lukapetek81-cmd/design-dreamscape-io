import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

type Entry = { name: string; license: string; url: string };

const LIBRARIES: Entry[] = [
  { name: 'React', license: 'MIT', url: 'https://github.com/facebook/react' },
  { name: 'React Router', license: 'MIT', url: 'https://github.com/remix-run/react-router' },
  { name: 'Vite', license: 'MIT', url: 'https://github.com/vitejs/vite' },
  { name: 'TypeScript', license: 'Apache-2.0', url: 'https://github.com/microsoft/TypeScript' },
  { name: 'Tailwind CSS', license: 'MIT', url: 'https://github.com/tailwindlabs/tailwindcss' },
  { name: 'shadcn/ui', license: 'MIT', url: 'https://github.com/shadcn-ui/ui' },
  { name: 'Radix UI', license: 'MIT', url: 'https://github.com/radix-ui/primitives' },
  { name: 'Lucide Icons', license: 'ISC', url: 'https://github.com/lucide-icons/lucide' },
  { name: 'TanStack Query', license: 'MIT', url: 'https://github.com/TanStack/query' },
  { name: 'Recharts', license: 'MIT', url: 'https://github.com/recharts/recharts' },
  { name: 'Zod', license: 'MIT', url: 'https://github.com/colinhacks/zod' },
  { name: 'date-fns', license: 'MIT', url: 'https://github.com/date-fns/date-fns' },
  { name: 'Supabase JS', license: 'MIT', url: 'https://github.com/supabase/supabase-js' },
  { name: 'Capacitor', license: 'MIT', url: 'https://github.com/ionic-team/capacitor' },
  { name: 'Sonner', license: 'MIT', url: 'https://github.com/emilkowalski/sonner' },
  { name: 'Vercel AI SDK', license: 'Apache-2.0', url: 'https://github.com/vercel/ai' },
  { name: 'Streamdown', license: 'MIT', url: 'https://github.com/vercel/streamdown' },
  { name: 'Mermaid', license: 'MIT', url: 'https://github.com/mermaid-js/mermaid' },
  { name: 'React Hook Form', license: 'MIT', url: 'https://github.com/react-hook-form/react-hook-form' },
  { name: 'Motion (Framer Motion)', license: 'MIT', url: 'https://github.com/motiondivision/motion' },
  { name: 'next-themes', license: 'MIT', url: 'https://github.com/pacocoursey/next-themes' },
  { name: 'cmdk', license: 'MIT', url: 'https://github.com/pacocoursey/cmdk' },
  { name: 'Embla Carousel', license: 'MIT', url: 'https://github.com/davidjerleke/embla-carousel' },
  { name: 'class-variance-authority', license: 'Apache-2.0', url: 'https://github.com/joe-bell/cva' },
  { name: 'tailwind-merge', license: 'MIT', url: 'https://github.com/dcastil/tailwind-merge' },
  { name: 'RevenueCat Purchases Capacitor', license: 'MIT', url: 'https://github.com/RevenueCat/purchases-capacitor' },
  { name: 'lodash', license: 'MIT', url: 'https://github.com/lodash/lodash' },
  { name: 'axios', license: 'MIT', url: 'https://github.com/axios/axios' },
];

const DATA_SOURCES: Entry[] = [
  { name: 'OilPriceAPI', license: 'Commercial license', url: 'https://oilpriceapi.com' },
  { name: 'Financial Modeling Prep', license: 'Commercial license', url: 'https://financialmodelingprep.com' },
  { name: 'Marketaux', license: 'Commercial license', url: 'https://www.marketaux.com' },
  { name: 'BloFin API', license: 'Commercial license', url: 'https://blofin.com' },
];

const Licenses: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Open Source Licenses - Commodity Hub"
        description="Open source software, library attributions, and data source licenses used by Commodity Hub."
        keywords={['licenses', 'open source', 'attributions', 'oss']}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Open Source Licenses & Attributions
              </CardTitle>
              <CardDescription>
                Commodity Hub is built on the shoulders of giants. We gratefully acknowledge the
                open source projects and data providers listed below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 text-sm leading-relaxed">
              <section>
                <h2 className="text-lg font-semibold mb-3">Software libraries</h2>
                <ul className="divide-y divide-border rounded-md border">
                  {LIBRARIES.map((lib) => (
                    <li key={lib.name} className="flex items-center justify-between gap-4 px-4 py-2">
                      <a
                        href={lib.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {lib.name}
                      </a>
                      <span className="text-muted-foreground text-xs">{lib.license}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">Data sources</h2>
                <ul className="divide-y divide-border rounded-md border">
                  {DATA_SOURCES.map((src) => (
                    <li key={src.name} className="flex items-center justify-between gap-4 px-4 py-2">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {src.name}
                      </a>
                      <span className="text-muted-foreground text-xs">{src.license}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <p className="text-muted-foreground">
                  Full license texts are available at each project's homepage. For questions about
                  attributions, contact{' '}
                  <a href="mailto:legal@commodity-hub.app" className="underline">
                    legal@commodity-hub.app
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Licenses;