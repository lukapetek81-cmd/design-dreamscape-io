import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import CommoditySidebar from "@/components/CommoditySidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Plus, X, TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  group: string;
}

interface ComparisonSession {
  id: string;
  comparison_name: string;
  commodities: Commodity[];
  created_at: string;
}

const SAMPLE_COMMODITIES: Commodity[] = [
  { name: "Crude Oil", symbol: "CL", price: 87.45, change: 1.23, changePercent: 1.43, group: "energy" },
  { name: "Gold", symbol: "GC", price: 2045.30, change: -5.40, changePercent: -0.26, group: "metals" },
  { name: "Silver", symbol: "SI", price: 24.78, change: 0.32, changePercent: 1.31, group: "metals" },
  { name: "Natural Gas", symbol: "NG", price: 2.65, change: -0.08, changePercent: -2.93, group: "energy" },
  { name: "Copper", symbol: "HG", price: 4.12, change: 0.05, changePercent: 1.23, group: "metals" },
  { name: "Wheat", symbol: "ZW", price: 6.78, change: 0.15, changePercent: 2.26, group: "grains" },
  { name: "Corn", symbol: "ZC", price: 4.89, change: -0.03, changePercent: -0.61, group: "grains" },
  { name: "Coffee", symbol: "KC", price: 1.85, change: 0.07, changePercent: 3.93, group: "softs" },
];

const PriceComparison = () => {
  const [activeGroup, setActiveGroup] = useState("energy");
  const [selectedCommodities, setSelectedCommodities] = useState<Commodity[]>([]);
  const [availableCommodities] = useState<Commodity[]>(SAMPLE_COMMODITIES);
  const [comparisonName, setComparisonName] = useState("");
  const [savedComparisons, setSavedComparisons] = useState<ComparisonSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0
  };

  useEffect(() => {
    if (user) {
      fetchSavedComparisons();
    }
  }, [user]);

  const fetchSavedComparisons = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('price_comparisons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSavedComparisons((data || []).map(item => ({
        ...item,
        commodities: item.commodities as unknown as Commodity[]
      })));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved comparisons",
        variant: "destructive",
      });
    }
  };

  const addCommodity = (commodity: Commodity) => {
    if (selectedCommodities.find(c => c.symbol === commodity.symbol)) {
      toast({
        title: "Already Added",
        description: "This commodity is already in your comparison",
        variant: "destructive",
      });
      return;
    }

    if (selectedCommodities.length >= 6) {
      toast({
        title: "Limit Reached",
        description: "You can compare up to 6 commodities at once",
        variant: "destructive",
      });
      return;
    }

    setSelectedCommodities(prev => [...prev, commodity]);
  };

  const removeCommodity = (symbol: string) => {
    setSelectedCommodities(prev => prev.filter(c => c.symbol !== symbol));
  };

  const saveComparison = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save comparisons",
        variant: "destructive",
      });
      return;
    }

    if (selectedCommodities.length < 2) {
      toast({
        title: "Insufficient Commodities",
        description: "Please select at least 2 commodities to compare",
        variant: "destructive",
      });
      return;
    }

    if (!comparisonName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this comparison",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('price_comparisons')
        .insert({
          user_id: user.id,
          comparison_name: comparisonName,
          commodities: selectedCommodities as any
        });

      if (error) throw error;

      toast({
        title: "Comparison Saved",
        description: "Your price comparison has been saved successfully",
      });

      setComparisonName("");
      await fetchSavedComparisons();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save comparison",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = (comparison: ComparisonSession) => {
    setSelectedCommodities(comparison.commodities);
    setComparisonName(comparison.comparison_name);
  };

  const deleteComparison = async (comparisonId: string) => {
    try {
      const { error } = await supabase
        .from('price_comparisons')
        .delete()
        .eq('id', comparisonId);

      if (error) throw error;

      setSavedComparisons(prev => prev.filter(c => c.id !== comparisonId));
      toast({
        title: "Comparison Deleted",
        description: "The comparison has been deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comparison",
        variant: "destructive",
      });
    }
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CommoditySidebar 
          activeGroup={activeGroup}
          onGroupSelect={setActiveGroup}
          commodityCounts={commodityCounts}
        />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Price Comparison</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Commodity Price Comparison
                </h2>
                <p className="text-muted-foreground">
                  Compare prices and performance across different commodities
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Comparison</CardTitle>
                      <CardDescription>
                        Selected commodities for side-by-side analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedCommodities.length === 0 ? (
                        <div className="text-center py-12">
                          <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No commodities selected</h3>
                          <p className="text-muted-foreground">
                            Add commodities from the panel to start comparing
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                              placeholder="Comparison name (optional)"
                              value={comparisonName}
                              onChange={(e) => setComparisonName(e.target.value)}
                              className="flex-1"
                            />
                            <Button onClick={saveComparison} disabled={loading}>
                              Save Comparison
                            </Button>
                          </div>
                          
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {selectedCommodities.map((commodity) => (
                              <Card key={commodity.symbol} className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 p-0"
                                  onClick={() => removeCommodity(commodity.symbol)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold">{commodity.name}</h3>
                                      <Badge variant="secondary" className="text-xs">
                                        {commodity.symbol}
                                      </Badge>
                                    </div>
                                    <div className="text-2xl font-bold">
                                      ${commodity.price.toFixed(2)}
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${getPriceChangeColor(commodity.change)}`}>
                                      {getPriceChangeIcon(commodity.change)}
                                      <span>
                                        {commodity.change > 0 ? '+' : ''}{commodity.change.toFixed(2)}
                                      </span>
                                      <span>
                                        ({commodity.changePercent > 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%)
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Commodities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {availableCommodities.map((commodity) => {
                        const isSelected = selectedCommodities.some(c => c.symbol === commodity.symbol);
                        return (
                          <div key={commodity.symbol} 
                               className={`flex items-center justify-between p-2 border rounded ${
                                 isSelected ? 'bg-muted' : ''
                               }`}>
                            <div>
                              <div className="font-medium text-sm">{commodity.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {commodity.symbol} - ${commodity.price.toFixed(2)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addCommodity(commodity)}
                              disabled={isSelected}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {savedComparisons.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Saved Comparisons</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {savedComparisons.map((comparison) => (
                          <div key={comparison.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium text-sm">{comparison.comparison_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {comparison.commodities.length} commodities
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadComparison(comparison)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteComparison(comparison.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PriceComparison;