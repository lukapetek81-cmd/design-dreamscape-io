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
import { BarChart, Plus, X, TrendingUp, TrendingDown, Minus, ArrowLeft, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PriceComparisonChart } from "@/components/PriceComparisonChart";
import { useQuery } from "@tanstack/react-query";

interface Commodity {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  group: string;
  contractSymbol?: string; // Optional contract symbol for futures
}

interface FuturesContract {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  category: string;
  contractSize: string;
  venue: string;
  supportedByFMP: boolean;
  expirationDate?: string;
  source?: string;
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
  const [showContracts, setShowContracts] = useState<Record<string, boolean>>({});
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const commodityCounts = {
    energy: 0, metals: 0, grains: 0, livestock: 0, softs: 0, other: 0
  };

  // Fetch IBKR contracts for a specific commodity (premium users only)
  const useIBKRContracts = (commodityName: string) => {
    const { isPremium } = useAuth();
    
    return useQuery({
      queryKey: ['ibkr-contracts', commodityName],
      queryFn: async () => {
        const { data, error } = await supabase.functions.invoke('fetch-ibkr-futures', {
          body: { commodity: commodityName }
        });
        
        if (error) throw new Error(error.message);
        return data.contracts as FuturesContract[];
      },
      enabled: !!commodityName && showContracts[commodityName] && isPremium,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
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

  const addCommodity = (commodity: Commodity, contractSymbol?: string) => {
    const key = contractSymbol ? `${commodity.symbol}-${contractSymbol}` : commodity.symbol;
    
    if (selectedCommodities.find(c => 
      (c.contractSymbol && contractSymbol) 
        ? `${c.symbol}-${c.contractSymbol}` === key
        : c.symbol === commodity.symbol && !contractSymbol
    )) {
      toast({
        title: "Already Added",
        description: "This commodity/contract is already in your comparison",
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

    const commodityToAdd: Commodity = {
      ...commodity,
      contractSymbol,
      symbol: contractSymbol || commodity.symbol
    };

    setSelectedCommodities(prev => [...prev, commodityToAdd]);
  };

  const removeCommodity = (symbol: string, contractSymbol?: string) => {
    setSelectedCommodities(prev => prev.filter(c => {
      if (contractSymbol) {
        return !(c.symbol === symbol && c.contractSymbol === contractSymbol);
      }
      return c.symbol !== symbol;
    }));
  };

  const toggleContractsView = (commodityName: string) => {
    setShowContracts(prev => ({
      ...prev,
      [commodityName]: !prev[commodityName]
    }));
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
              onClick={() => {
                console.log('Back button clicked');
                navigate(-1);
              }}
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
                <div className="lg:col-span-3 space-y-6">
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
                                   onClick={() => removeCommodity(commodity.symbol, commodity.contractSymbol)}
                                 >
                                   <X className="h-4 w-4" />
                                 </Button>
                                 <CardContent className="p-4">
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2">
                                       <h3 className="font-semibold">{commodity.name}</h3>
                                       <Badge variant="secondary" className="text-xs">
                                         {commodity.contractSymbol || commodity.symbol}
                                       </Badge>
                                       {commodity.contractSymbol && (
                                         <Badge variant="outline" className="text-xs">
                                           <Calendar className="w-3 h-3 mr-1" />
                                           Contract
                                         </Badge>
                                       )}
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

                  {/* Real-time Price Chart */}
                  {selectedCommodities.length >= 2 && (
                    <PriceComparisonChart commodities={selectedCommodities} />
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Commodities
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                       {availableCommodities.map((commodity) => {
                         const contractsQuery = useIBKRContracts(commodity.name);
                         const hasContracts = contractsQuery.data && contractsQuery.data.length > 0;
                         const showingContracts = showContracts[commodity.name];
                         
                         return (
                           <div key={commodity.symbol} className="space-y-2">
                             {/* Base Commodity */}
                             <div className={`flex items-center justify-between p-2 border rounded ${
                               selectedCommodities.some(c => c.symbol === commodity.symbol && !c.contractSymbol) ? 'bg-muted' : ''
                             }`}>
                               <div className="flex-1">
                                 <div className="font-medium text-sm">{commodity.name}</div>
                                 <div className="text-xs text-muted-foreground">
                                   {commodity.symbol} - ${commodity.price.toFixed(2)}
                                 </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {isPremium && hasContracts && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleContractsView(commodity.name)}
                                    >
                                      <Calendar className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => addCommodity(commodity)}
                                   disabled={selectedCommodities.some(c => c.symbol === commodity.symbol && !c.contractSymbol)}
                                 >
                                   <Plus className="h-4 w-4" />
                                 </Button>
                               </div>
                             </div>
                              
                              {/* Futures Contracts - Only show for premium users */}
                              {isPremium && showingContracts && hasContracts && (
                               <div className="ml-4 space-y-1">
                                 {contractsQuery.data?.slice(0, 6).map((contract) => {
                                   const isSelected = selectedCommodities.some(c => 
                                     c.symbol === commodity.symbol && c.contractSymbol === contract.symbol
                                   );
                                   
                                   return (
                                     <div key={contract.symbol} 
                                          className={`flex items-center justify-between p-2 border rounded text-sm ${
                                            isSelected ? 'bg-muted' : ''
                                          }`}>
                                        <div className="flex-1">
                                          <div className="font-medium flex items-center gap-2">
                                            <span>{contract.symbol}</span>
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ${contract.price.toFixed(2)} • Vol: {contract.volume.toLocaleString()}
                                            {contract.expirationDate && ` • Exp: ${new Date(contract.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                          </div>
                                        </div>
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         onClick={() => addCommodity({
                                           ...commodity,
                                           price: contract.price,
                                           change: contract.change,
                                           changePercent: contract.changePercent
                                         }, contract.symbol)}
                                         disabled={isSelected}
                                       >
                                         <Plus className="h-4 w-4" />
                                       </Button>
                                     </div>
                                   );
                                 })}
                                </div>
                              )}

                              {/* Premium upgrade prompt for futures contracts */}
                              {!isPremium && (
                                <div className="ml-4 mt-2 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                    <span>Upgrade to Premium to access futures contracts</span>
                                  </div>
                                </div>
                              )}
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