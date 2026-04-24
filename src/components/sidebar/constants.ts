import { Zap, Coins, Wheat, Beef, Coffee, Star, Factory } from "lucide-react";
import { CommodityGroup, MarketTool } from "./types";

export const COMMODITY_GROUPS: CommodityGroup[] = [
  { id: "energy", label: "Energy", icon: Zap, color: "text-orange-500" },
  { id: "metals", label: "Metals", icon: Coins, color: "text-yellow-500" },
  { id: "grains", label: "Grains", icon: Wheat, color: "text-green-500" },
  { id: "livestock", label: "Livestock", icon: Beef, color: "text-red-500" },
  { id: "softs", label: "Softs", icon: Coffee, color: "text-amber-600" },
  { id: "industrials", label: "Industrials", icon: Factory, color: "text-cyan-500" },
];

export const MARKET_TOOLS: MarketTool[] = [
  { id: "watchlists", label: "Watchlists", icon: Star, color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400", path: "/watchlists" },
];
