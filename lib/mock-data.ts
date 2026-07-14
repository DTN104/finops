export const dashboardData = {
  asOf: "Tuesday, 14 July",
  metrics: [
    { label: "Net portfolio value", value: "₫1.284B", supporting: "+₫34.82M   +2.79%", trend: "positive" },
    { label: "Buying power", value: "₫486.2M", supporting: "37.8% available", trend: "neutral" },
    { label: "Day P&L", value: "+₫8.62M", supporting: "+0.67% today", trend: "positive" },
    { label: "Open orders", value: "12", supporting: "4 pending review", trend: "warning" },
  ],
  equityHeights: [36, 45, 42, 55, 62, 71, 66, 81, 91, 85, 101, 109, 105, 120, 128, 137, 132, 145, 154, 163, 157, 171, 177, 181, 187],
  watchlist: [
    { symbol: "FPT", price: "126,400", change: "+2.10%", direction: "up" },
    { symbol: "VCB", price: "58,900", change: "-0.34%", direction: "down" },
    { symbol: "HPG", price: "31,250", change: "+1.72%", direction: "up" },
    { symbol: "MWG", price: "65,800", change: "+0.46%", direction: "up" },
    { symbol: "SSI", price: "37,100", change: "-0.80%", direction: "down" },
  ],
  holdings: [
    { symbol: "FPT", quantity: "2,400", last: "₫126,400", value: "₫303.36M", return: "+12.8%", direction: "up" },
    { symbol: "VCB", quantity: "3,000", last: "₫58,900", value: "₫176.70M", return: "-1.2%", direction: "down" },
    { symbol: "HPG", quantity: "4,500", last: "₫31,250", value: "₫140.63M", return: "+5.4%", direction: "up" },
    { symbol: "MWG", quantity: "1,600", last: "₫65,800", value: "₫105.28M", return: "+3.1%", direction: "up" },
  ],
} as const;

export type Holding = (typeof dashboardData.holdings)[number];
