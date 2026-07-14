export interface MarketInstrument {
  symbol: string;
  company: string;
  last: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  exchange: "HOSE";
  sector: string;
  status: "TRADING";
}

const featured: readonly Omit<MarketInstrument, "changePercent" | "exchange" | "status">[] = [
  { symbol: "FPT", company: "FPT Corporation", last: 126400, previousClose: 123800, volume: 5842100, bid: 126300, ask: 126500, sector: "Technology" },
  { symbol: "VCB", company: "Vietcombank", last: 58900, previousClose: 59100, volume: 3104200, bid: 58800, ask: 59000, sector: "Banking" },
  { symbol: "HPG", company: "Hoa Phat Group", last: 31250, previousClose: 30720, volume: 22941500, bid: 31200, ask: 31300, sector: "Industrials" },
  { symbol: "MWG", company: "Mobile World", last: 65800, previousClose: 65500, volume: 4812700, bid: 65700, ask: 65900, sector: "Retail" },
  { symbol: "SSI", company: "SSI Securities", last: 37100, previousClose: 37400, volume: 17331200, bid: 37050, ask: 37150, sector: "Financials" },
  { symbol: "VNM", company: "Vinamilk", last: 73600, previousClose: 73400, volume: 2408900, bid: 73500, ask: 73700, sector: "Consumer" },
  { symbol: "GAS", company: "PV Gas", last: 82400, previousClose: 83300, volume: 1228400, bid: 82300, ask: 82500, sector: "Energy" },
  { symbol: "TCB", company: "Techcombank", last: 48650, previousClose: 48100, volume: 10604300, bid: 48600, ask: 48700, sector: "Banking" },
  { symbol: "VIC", company: "Vingroup", last: 46900, previousClose: 46900, volume: 6883100, bid: 46850, ask: 46950, sector: "Real Estate" },
  { symbol: "MSN", company: "Masan Group", last: 79200, previousClose: 78600, volume: 3552800, bid: 79100, ask: 79300, sector: "Consumer" },
];

function completeInstrument(instrument: Omit<MarketInstrument, "changePercent" | "exchange" | "status">): MarketInstrument {
  return {
    ...instrument,
    changePercent: Number((((instrument.last - instrument.previousClose) / instrument.previousClose) * 100).toFixed(2)),
    exchange: "HOSE",
    status: "TRADING",
  };
}

export const marketInstruments: readonly MarketInstrument[] = [
  ...featured.map(completeInstrument),
  ...Array.from({ length: 4990 }, (_, index) => {
    const number = index + 11;
    const last = 12000 + ((number * 137) % 110000);
    const direction = number % 5 === 0 ? -1 : number % 3 === 0 ? 0 : 1;
    const previousClose = last - direction * (100 + (number % 8) * 50);
    return completeInstrument({
      symbol: `M${String(number).padStart(4, "0")}`,
      company: `Mock HOSE Company ${String(number).padStart(4, "0")}`,
      last,
      previousClose,
      volume: 250000 + ((number * 918273) % 24000000),
      bid: last - 100,
      ask: last + 100,
      sector: ["Technology", "Banking", "Industrials", "Retail", "Consumer"][number % 5],
    });
  }),
];

export const fptOrderBook = [
  { price: 126500, quantity: 18200, total: "2.30B", side: "ask" },
  { price: 126450, quantity: 12600, total: "1.59B", side: "ask" },
  { price: 126400, quantity: 9800, total: "1.24B", side: "mid" },
  { price: 126350, quantity: 14400, total: "1.82B", side: "bid" },
  { price: 126300, quantity: 21600, total: "2.73B", side: "bid" },
  { price: 126250, quantity: 17100, total: "2.16B", side: "bid" },
] as const;

export function formatMarketPrice(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
