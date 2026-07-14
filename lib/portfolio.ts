export interface PortfolioPosition {
  symbol: string;
  company: string;
  sector: "Technology" | "Financials" | "Industrials" | "Consumer";
  quantity: number;
  averageCost: number;
  last: number;
  previousClose: number;
}

export interface PositionMetrics extends PortfolioPosition {
  costBasis: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPercent: number;
  dayPnl: number;
  dayPercent: number;
}

export interface AllocationSlice {
  label: PortfolioPosition["sector"] | "Cash";
  value: number;
  percent: number;
  tone: "brand" | "info" | "profit" | "warning" | "neutral";
}

export interface PortfolioMetrics {
  positions: PositionMetrics[];
  marketValue: number;
  costBasis: number;
  cashBalance: number;
  netAssetValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalReturn: number;
  totalReturnPercent: number;
  allocations: AllocationSlice[];
}

export const initialPositions: Record<string, PortfolioPosition> = {
  FPT: { symbol: "FPT", company: "FPT Corporation", sector: "Technology", quantity: 2_400, averageCost: 112_100, last: 126_400, previousClose: 123_800 },
  VCB: { symbol: "VCB", company: "Vietcombank", sector: "Financials", quantity: 3_000, averageCost: 59_600, last: 58_900, previousClose: 59_100 },
  HPG: { symbol: "HPG", company: "Hoa Phat Group", sector: "Industrials", quantity: 4_500, averageCost: 29_650, last: 31_250, previousClose: 30_720 },
  MWG: { symbol: "MWG", company: "Mobile World", sector: "Consumer", quantity: 1_600, averageCost: 63_800, last: 65_800, previousClose: 65_500 },
  SSI: { symbol: "SSI", company: "SSI Securities", sector: "Financials", quantity: 1_200, averageCost: 37_400, last: 37_100, previousClose: 37_400 },
  VNM: { symbol: "VNM", company: "Vinamilk", sector: "Consumer", quantity: 380, averageCost: 71_900, last: 73_600, previousClose: 73_400 },
};

const allocationTones: Record<AllocationSlice["label"], AllocationSlice["tone"]> = {
  Technology: "brand",
  Financials: "info",
  Industrials: "profit",
  Consumer: "warning",
  Cash: "neutral",
};

export function calculatePosition(position: PortfolioPosition): PositionMetrics {
  const costBasis = position.quantity * position.averageCost;
  const marketValue = position.quantity * position.last;
  const unrealizedPnl = marketValue - costBasis;
  const dayPnl = position.quantity * (position.last - position.previousClose);

  return {
    ...position,
    costBasis,
    marketValue,
    unrealizedPnl,
    unrealizedPercent: costBasis ? (unrealizedPnl / costBasis) * 100 : 0,
    dayPnl,
    dayPercent: position.previousClose ? ((position.last - position.previousClose) / position.previousClose) * 100 : 0,
  };
}

export function calculatePortfolio(positions: Record<string, PortfolioPosition>, cashBalance: number, realizedPnl: number): PortfolioMetrics {
  const calculatedPositions = Object.values(positions).filter((position) => position.quantity > 0).map(calculatePosition);
  const marketValue = calculatedPositions.reduce((total, position) => total + position.marketValue, 0);
  const costBasis = calculatedPositions.reduce((total, position) => total + position.costBasis, 0);
  const unrealizedPnl = calculatedPositions.reduce((total, position) => total + position.unrealizedPnl, 0);
  const netAssetValue = marketValue + cashBalance;
  const totalReturn = unrealizedPnl + realizedPnl;
  const contributedCapital = netAssetValue - totalReturn;
  const sectorValues = calculatedPositions.reduce<Partial<Record<PortfolioPosition["sector"], number>>>((values, position) => {
    values[position.sector] = (values[position.sector] ?? 0) + position.marketValue;
    return values;
  }, {});

  const allocationValues: Array<[AllocationSlice["label"], number]> = [
    ["Technology", sectorValues.Technology ?? 0],
    ["Financials", sectorValues.Financials ?? 0],
    ["Industrials", sectorValues.Industrials ?? 0],
    ["Consumer", sectorValues.Consumer ?? 0],
    ["Cash", cashBalance],
  ];

  return {
    positions: calculatedPositions,
    marketValue,
    costBasis,
    cashBalance,
    netAssetValue,
    unrealizedPnl,
    realizedPnl,
    totalReturn,
    totalReturnPercent: contributedCapital ? (totalReturn / contributedCapital) * 100 : 0,
    allocations: allocationValues.map(([label, value]) => ({
      label,
      value,
      percent: netAssetValue ? (value / netAssetValue) * 100 : 0,
      tone: allocationTones[label],
    })),
  };
}

export function formatCompactVnd(value: number, signed = false): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : "";
  if (absolute >= 1_000_000_000) return `${sign}₫${(absolute / 1_000_000_000).toFixed(3)}B`;
  if (absolute >= 1_000_000) return `${sign}₫${(absolute / 1_000_000).toFixed(2)}M`;
  return `${sign}₫${Math.round(absolute).toLocaleString("en-US")}`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
