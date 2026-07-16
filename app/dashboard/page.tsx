import Link from "next/link";
import { redirect } from "next/navigation";

import { EquityBars } from "@/components/dashboard/equity-bars";
import { AppShell } from "@/components/shell/app-shell";
import { DataTable, MetricCard, type DataTableColumn, type MetricCardTrend } from "@/components/ui";
import { formatMarketPrice, formatPercent, marketInstruments } from "@/lib/market-data";
import { calculatePortfolio, formatCompactVnd, formatSignedPercent } from "@/lib/portfolio";
import { getDemoSession } from "@/lib/session";
import { getPortfolioSnapshot } from "@/src/services/query.service";

interface Holding {
  symbol: string;
  quantity: string;
  last: string;
  value: string;
  return: string;
  direction: "up" | "down";
}

const holdingColumns: readonly DataTableColumn<Holding>[] = [
  { key: "symbol", header: "Symbol", className: "w-[15%] text-primary", cell: (row) => row.symbol },
  { key: "quantity", header: "Quantity", className: "w-[14%]", cell: (row) => row.quantity },
  { key: "last", header: "Last", className: "w-[17%]", cell: (row) => row.last },
  { key: "value", header: "Market value", className: "w-[17%]", cell: (row) => row.value },
  {
    key: "return",
    header: "Return",
    className: "w-[12%]",
    cell: (row) => (
      <span className={row.direction === "up" ? "text-profit" : "text-loss"}>
        <span className="sr-only">{row.direction === "up" ? "Gain" : "Loss"}: </span>
        {row.return}
      </span>
    ),
  },
];

export default async function DashboardPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  const snapshot = await getPortfolioSnapshot(user.id, user.name);
  if (!snapshot) redirect("/login");

  const portfolio = calculatePortfolio(snapshot.positions, snapshot.cashBalance, snapshot.realizedPnl);
  const dayPnl = portfolio.positions.reduce((total, position) => total + position.dayPnl, 0);
  const openOrders = snapshot.orders.filter((order) => order.status === "OPEN" || order.status === "PARTIAL" || order.status === "PENDING");
  const pendingOrders = openOrders.filter((order) => order.status === "PENDING").length;
  const netDirection = portfolio.totalReturn >= 0 ? "up" : "down";

  const holdings: Holding[] = portfolio.positions
    .slice()
    .sort((left, right) => right.marketValue - left.marketValue)
    .slice(0, 4)
    .map((position) => ({
      symbol: position.symbol,
      quantity: position.quantity.toLocaleString("en-US"),
      last: formatCompactVnd(position.last),
      value: formatCompactVnd(position.marketValue),
      return: formatSignedPercent(position.unrealizedPercent),
      direction: position.unrealizedPnl >= 0 ? "up" : "down",
    }));

  const metrics: { label: string; value: string; supporting: string; trend: MetricCardTrend; desktopOnly?: boolean }[] = [
    {
      label: "Buying power",
      value: formatCompactVnd(snapshot.buyingPower),
      supporting: `${(snapshot.buyingPower / Math.max(1, portfolio.netAssetValue) * 100).toFixed(1)}% available`,
      trend: "neutral",
    },
    {
      label: "Day P&L",
      value: formatCompactVnd(dayPnl, true),
      supporting: `${formatSignedPercent(dayPnl / Math.max(1, portfolio.netAssetValue) * 100, 2)} today`,
      trend: dayPnl >= 0 ? "positive" : "negative",
    },
    {
      label: "Open orders",
      value: openOrders.length.toString(),
      supporting: `${pendingOrders} pending review`,
      trend: pendingOrders ? "warning" : "neutral",
      desktopOnly: true,
    },
  ];

  const watchlist = marketInstruments.slice(0, 5).map((instrument) => ({
    symbol: instrument.symbol,
    price: formatMarketPrice(instrument.last),
    change: formatPercent(instrument.changePercent),
    direction: instrument.changePercent >= 0 ? "up" : "down",
  }));

  return (
    <AppShell user={user}>
      <main className="mx-auto w-full max-w-[1280px] px-4 pb-6 pt-5 lg:px-8 lg:pb-12 lg:pt-7">
        <header className="flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="type-body-s text-secondary lg:hidden">Good morning, {user.name.split(" ")[0]}</p>
            <h1 className="mt-0.5 min-w-0 [overflow-wrap:anywhere] text-[24px] leading-8 font-semibold lg:mt-0 lg:text-[32px] lg:leading-10 lg:font-bold">
              Portfolio overview
            </h1>
            <p className="type-body-s hidden text-secondary lg:block">15 July 2026 · Simulated prices update every 500 ms</p>
          </div>
          <div className="mb-1 flex shrink-0 items-center gap-2 type-label-m text-profit" aria-label="Market data is live">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-profit" />
            <span>LIVE</span>
          </div>
        </header>

        <section aria-label="Portfolio metrics" className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <article className="flex min-h-[208px] min-w-0 flex-col rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 lg:min-h-[264px] lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="type-label-m text-[var(--color-muted)]">NET PORTFOLIO VALUE</p>
              <span className="type-data-s text-[var(--color-muted)]">VND</span>
            </div>
            <p className="mt-5 min-w-0 [overflow-wrap:anywhere] font-mono text-[length:var(--text-display)] leading-none font-medium tracking-[-0.04em] text-[var(--color-ink)]">
              {formatCompactVnd(portfolio.netAssetValue)}
            </p>
            <div className="mt-auto grid grid-cols-2 gap-4 border-t border-[var(--color-rule)] pt-4">
              <div>
                <p className="type-body-s text-[var(--color-muted)]">Total return</p>
                <p className={`type-data-m mt-1 ${netDirection === "up" ? "text-profit" : "text-loss"}`}>
                  <span className="sr-only">{netDirection === "up" ? "Gain" : "Loss"}: </span>
                  {formatCompactVnd(portfolio.totalReturn, true)}
                </p>
              </div>
              <div className="text-right">
                <p className="type-body-s text-[var(--color-muted)]">Return rate</p>
                <p className={`type-data-m mt-1 ${netDirection === "up" ? "text-profit" : "text-loss"}`}>
                  <span className="sr-only">{netDirection === "up" ? "Gain" : "Loss"}: </span>
                  {formatSignedPercent(portfolio.totalReturnPercent, 2)}
                </p>
              </div>
            </div>
          </article>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-3">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                supporting={metric.supporting}
                trend={metric.trend}
                className={`${metric.desktopOnly ? "col-span-2 hidden lg:flex lg:col-span-1" : ""} h-[104px] w-auto gap-[var(--space-1)] rounded-[var(--radius-card)] border-[var(--color-rule)] bg-[var(--color-paper-2)] p-[var(--space-3)] lg:h-auto lg:min-h-0 lg:px-[var(--space-md)] lg:py-[var(--space-sm)] [&_[data-slot=trend-bar]]:hidden`}
              />
            ))}
          </div>
        </section>

        <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <article className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4 lg:p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[16px] leading-6 font-semibold lg:text-[20px] lg:leading-7">30-day equity curve</h2>
              <span className="type-data-s text-profit">30D</span>
            </div>
            <figure className="mt-3">
              <div className="h-[150px] min-w-0 rounded-[var(--radius-md)] bg-[var(--color-paper)] lg:h-[248px]">
                <EquityBars compact className="h-full lg:hidden" />
                <EquityBars className="hidden h-full lg:block" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-3 type-data-s text-[var(--color-muted)]">
                <span>Simulated close values</span>
                <span className="whitespace-nowrap">500 ms feed</span>
              </figcaption>
            </figure>
          </article>

          <article className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 pb-2 pt-4 lg:px-5 lg:pt-5">
            <div className="flex min-h-8 items-start justify-between gap-4">
              <h2 className="text-[16px] leading-6 font-semibold lg:text-[20px] lg:leading-7">Watchlist</h2>
              <Link href="/market" className="hidden min-h-11 shrink-0 items-center whitespace-nowrap text-secondary transition-[color,transform] duration-[var(--dur-micro)] ease-[var(--ease-out)] hover:text-profit focus-visible:rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:translate-y-px lg:flex">
                View market
              </Link>
            </div>
            <div>
              {watchlist.map((quote) => (
                <div key={quote.symbol} className="grid min-h-11 grid-cols-3 items-center border-t border-[var(--color-rule)] type-data-s">
                  {quote.symbol === "FPT" ? (
                    <Link href="/market/FPT" className="flex min-h-11 items-center rounded-[var(--radius-control)] text-primary transition-[color,transform] duration-[var(--dur-micro)] ease-[var(--ease-out)] hover:text-profit focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus)] active:translate-y-px">
                      {quote.symbol}
                    </Link>
                  ) : (
                    <span className="type-data-m text-primary">{quote.symbol}</span>
                  )}
                  <span className="text-center text-secondary">{quote.price}</span>
                  <span className={`text-right ${quote.direction === "up" ? "text-profit" : "text-loss"}`}>
                    <span className="sr-only">{quote.direction === "up" ? "Gain" : "Loss"}: </span>
                    {quote.change}
                  </span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-3 hidden min-w-0 rounded-[var(--radius-card)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-5 pb-3 pt-4 lg:block">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <h2 className="type-heading-h3">Top holdings</h2>
            <Link href="/portfolio" className="flex min-h-11 shrink-0 items-center whitespace-nowrap text-secondary transition-[color,transform] duration-[var(--dur-micro)] ease-[var(--ease-out)] hover:text-profit focus-visible:rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:translate-y-px">
              View portfolio →
            </Link>
          </div>
          <DataTable caption="Top portfolio holdings" columns={holdingColumns} rows={holdings} getRowKey={(row) => row.symbol} hideHeader />
        </section>
      </main>
    </AppShell>
  );
}
