export interface CommodityCounts {
  energy: number;
  metals: number;
  grains: number;
  livestock: number;
  softs: number;
  other: number;
}

export interface CommodityGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
}

export interface MarketTool {
  id: string;
  label: string;
  icon: any;
  color: string;
  path: string;
}