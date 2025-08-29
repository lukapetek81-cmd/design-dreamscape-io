import { Zap, Coins, Wheat, TrendingUp, Beef, Coffee, Package, Newspaper, Moon, Sun, Monitor, Briefcase, Settings, BarChart3, Star, Filter, Calendar, Calculator, MessageSquare, Lightbulb, GraduationCap, Users, GitCompare, Activity, Database } from "lucide-react";
import { CommodityGroup, MarketTool } from "./types";

export const COMMODITY_GROUPS: CommodityGroup[] = [
  { id: "energy", label: "Energy", icon: Zap, color: "text-orange-500" },
  { id: "metals", label: "Metals", icon: Coins, color: "text-yellow-500" },
  { id: "grains", label: "Grains", icon: Wheat, color: "text-green-500" },
  { id: "livestock", label: "Livestock", icon: Beef, color: "text-red-500" },
  { id: "softs", label: "Softs", icon: Coffee, color: "text-amber-600" },
  { id: "other", label: "Other", icon: Package, color: "text-gray-500" },
];

export const MARKET_TOOLS: MarketTool[] = [
  { id: "portfolio", label: "Portfolio", icon: Briefcase, color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400", path: "/portfolio" },
  { id: "correlation", label: "Correlation", icon: BarChart3, color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400", path: "/correlation" },
  { id: "watchlists", label: "Watchlists", icon: Star, color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400", path: "/watchlists" },
  { id: "screener", label: "Screener", icon: Filter, color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400", path: "/screener" },
  { id: "calendar", label: "Calendar", icon: Calendar, color: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400", path: "/calendar" },
  { id: "risk-calculator", label: "Risk Calculator", icon: Calculator, color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400", path: "/risk-calculator" },
];

export const COMMUNITY_TOOLS: MarketTool[] = [
  { id: "community", label: "Community", icon: MessageSquare, color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400", path: "/community" },
  { id: "insights", label: "Expert Insights", icon: Lightbulb, color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400", path: "/insights" },
  { id: "learning", label: "Learning Hub", icon: GraduationCap, color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400", path: "/learning" },
  { id: "sentiment", label: "Market Sentiment", icon: Users, color: "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400", path: "/sentiment" },
];

export const ACTIVITY_TOOLS: MarketTool[] = [
  { id: "price-comparison", label: "Price Comparison", icon: GitCompare, color: "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400", path: "/price-comparison" },
  { id: "market-status", label: "Market Status", icon: Activity, color: "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400", path: "/market-status" },
];