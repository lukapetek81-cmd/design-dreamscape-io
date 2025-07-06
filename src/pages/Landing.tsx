import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  ArrowRight,
  CheckCircle,
  Coins,
  Wheat,
  Beef,
  Coffee,
  Package,
  Globe
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-Time Market Data",
      description: "Get live commodity prices and market updates as they happen"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive charts and analysis tools for informed trading decisions"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Monitoring",
      description: "Round-the-clock market monitoring across global exchanges"
    }
  ];

  const commodityGroups = [
    { name: "Energy", icon: <Zap className="w-5 h-5" />, count: "12+ commodities" },
    { name: "Metals", icon: <Coins className="w-5 h-5" />, count: "15+ commodities" },
    { name: "Agriculture", icon: <Wheat className="w-5 h-5" />, count: "20+ commodities" },
    { name: "Livestock", icon: <Beef className="w-5 h-5" />, count: "8+ commodities" },
    { name: "Soft Commodities", icon: <Coffee className="w-5 h-5" />, count: "10+ commodities" },
    { name: "Other", icon: <Package className="w-5 h-5" />, count: "5+ commodities" }
  ];

  const benefits = [
    "Real-time price updates",
    "Professional-grade charts",
    "Market sentiment analysis",
    "Portfolio tracking",
    "Expert insights",
    "Mobile-friendly interface"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gradient">Commodity Hub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Live Market Data
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Master Commodity Markets with
            <span className="block text-primary">Real-Time Intelligence</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track, analyze, and trade commodities with confidence. Get instant access to live market data,
            professional charts, and expert insights across all major commodity markets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Start Trading Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Commodity Groups */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Track Every Major Commodity Market</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive coverage across all commodity categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {commodityGroups.map((group, index) => (
              <Card key={index} className="text-center hover:shadow-medium transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      {group.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">{group.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Commodity Hub?</h2>
            <p className="text-lg text-muted-foreground">
              Professional-grade tools designed for serious commodity traders
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-medium transition-shadow duration-300">
                <CardHeader>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Everything You Need to Trade Commodities</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Crude Oil (WTI)</span>
                    <Badge variant="outline" className="text-green-600">+2.4%</Badge>
                  </div>
                  <div className="text-2xl font-bold">$72.45</div>
                  <div className="h-20 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-950/20 dark:to-green-900/10 rounded-lg flex items-end p-2">
                    <div className="w-full h-12 bg-gradient-to-t from-green-500 to-green-400 rounded opacity-60"></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live data updating every second
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of traders who trust Commodity Hub for their market intelligence.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Commodity Hub</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 Commodity Hub. Professional commodity market intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;