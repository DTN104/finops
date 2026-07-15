import Link from "next/link";

import { EquityBars } from "@/components/dashboard/equity-bars";
import { AllocationList } from "@/components/portfolio/allocation-list";
import { Button } from "@/components/ui";
import { calculatePortfolio, formatCompactVnd, formatSignedPercent, type PositionMetrics } from "@/lib/portfolio";
import type { PortfolioSnapshot } from "@/src/services/query.service";

export function PortfolioOverview({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const portfolio = calculatePortfolio(snapshot.positions, snapshot.cashBalance, snapshot.realizedPnl);

  return (
    <main className="p-4 lg:p-6">
      <header className="flex h-8 items-center justify-between lg:h-16">
        <div>
          <h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">Portfolio</h1>
          <p className="type-body-s hidden text-secondary lg:block">Positions, allocation and performance across your mock account.</p>
        </div>
        <p className="type-data-m text-profit lg:hidden"><span className="sr-only">Total return: </span>{formatSignedPercent(portfolio.totalReturnPercent, 2)}</p>
        <div className="hidden gap-[10px] lg:flex">
          <Button disabled variant="secondary" className="w-[148px]">Export CSV</Button>
          <Link href="/market/FPT" className="flex h-10 w-[148px] items-center justify-center rounded-[var(--radius-sm)] bg-brand type-label-l text-on-brand">Trade</Link>
        </div>
      </header>

      <section aria-label="Portfolio metrics" className="mt-[14px] lg:mt-[18px]">
        <article className="h-[126px] rounded-[14px] border border-border-default bg-surface p-[18px] lg:hidden">
          <p className="type-label-m text-muted">NET PORTFOLIO VALUE</p>
          <p className="mt-2 text-[32px] leading-10 font-bold">{formatCompactVnd(portfolio.netAssetValue)}</p>
          <p className="type-data-s mt-[7px] text-profit"><span className="sr-only">Total gain: </span>{formatCompactVnd(portfolio.totalReturn, true)} all time</p>
        </article>
        <div className="hidden grid-cols-4 gap-3 lg:grid">
          <PortfolioMetric label="Net portfolio value" value={formatCompactVnd(portfolio.netAssetValue)} supporting={`${formatCompactVnd(portfolio.unrealizedPnl, true)}  ${formatSignedPercent(portfolio.unrealizedPnl / Math.max(1, portfolio.costBasis) * 100, 2)}`} profit />
          <PortfolioMetric label="Market value" value={formatCompactVnd(portfolio.marketValue)} supporting={`${portfolio.positions.length} open positions`} />
          <PortfolioMetric label="Cash & buying power" value={formatCompactVnd(snapshot.buyingPower)} supporting={`${(snapshot.buyingPower / Math.max(1, portfolio.netAssetValue) * 100).toFixed(1)}% available`} />
          <PortfolioMetric label="Total return" value={formatCompactVnd(portfolio.totalReturn, true)} supporting={`${formatSignedPercent(portfolio.totalReturnPercent, 2)} all time`} profit />
        </div>
      </section>

      <div className="mt-[14px] lg:hidden">
        <AllocationList allocations={portfolio.allocations} mobile />
      </div>

      <section className="mt-[14px] hidden grid-cols-[minmax(0,720px)_minmax(300px,426px)] gap-[14px] lg:grid">
        <article className="h-[270px] rounded-[14px] border border-border-default bg-surface p-[18px]">
          <header className="flex h-7 items-center justify-between"><h2 className="type-heading-h3">Portfolio performance</h2><span className="type-data-s text-secondary">1M&nbsp;&nbsp;3M&nbsp;&nbsp;1Y&nbsp;&nbsp;ALL</span></header>
          <div className="mt-[14px] h-[180px] rounded-[12px] bg-canvas"><EquityBars count={22} chartWidth={680} start={12} blueCount={5} className="h-full" /></div>
        </article>
        <AllocationList allocations={portfolio.allocations} />
      </section>

      <div className="lg:mt-[18px]">
        <div className="hidden w-fit gap-1 rounded-[10px] bg-surface p-1 lg:flex" role="tablist" aria-label="Portfolio views">
          <button role="tab" aria-selected="true" className="rounded-[8px] bg-surface-raised px-[14px] py-2 type-label-m">Positions</button>
          <button role="tab" aria-selected="false" disabled className="px-[14px] py-2 type-label-m text-secondary">Allocation</button>
          <button role="tab" aria-selected="false" disabled className="px-[14px] py-2 type-label-m text-secondary">Transactions</button>
        </div>
        <Holdings positions={portfolio.positions} marketValue={portfolio.marketValue} />
      </div>
    </main>
  );
}

function PortfolioMetric({ label, value, supporting, profit = false }: { label: string; value: string; supporting: string; profit?: boolean }) {
  return (
    <article className="h-[110px] rounded-[14px] border border-border-default bg-surface p-4">
      <p className="type-body-s text-secondary">{label}</p>
      <p className="type-data-l mt-2">{value}</p>
      <p className={`type-data-s mt-2 ${profit ? "text-profit" : "text-muted"}`}>{supporting}</p>
    </article>
  );
}

function Holdings({ positions, marketValue }: { positions: PositionMetrics[]; marketValue: number }) {
  return (
    <section className="mt-[14px] overflow-hidden rounded-[14px] border border-border-default bg-surface lg:mt-[18px]">
      <h2 className="px-0 type-label-l lg:hidden">Holdings</h2>
      <table className="hidden w-full table-fixed border-collapse type-data-s lg:table">
        <caption className="sr-only">Current portfolio holdings</caption>
        <thead className="h-11 bg-surface-raised text-left type-label-m text-secondary"><tr><th className="px-[14px]">Symbol</th><th>Quantity</th><th>Avg cost</th><th>Last</th><th>Market value</th><th>Unrealized P&amp;L</th><th>Weight</th></tr></thead>
        <tbody>{positions.map((position) => <DesktopHolding key={position.symbol} position={position} marketValue={marketValue} />)}</tbody>
      </table>
      <div className="lg:hidden">
        {positions.slice(0, 4).map((position) => {
          const content = (
            <>
            <span><span className="type-label-l block">{position.symbol}</span><span className="type-data-s text-muted">{position.quantity.toLocaleString("en-US")} shares</span></span>
            <span className="text-right"><span className="type-data-s block text-secondary">{formatCompactVnd(position.marketValue)}</span><span className={`type-data-s ${position.unrealizedPnl >= 0 ? "text-profit" : "text-loss"}`}><span className="sr-only">{position.unrealizedPnl >= 0 ? "Gain" : "Loss"}: </span>{formatSignedPercent(position.unrealizedPercent)}</span></span>
            </>
          );
          const className = "flex h-[60px] items-center justify-between border-t border-border-default px-3 first:border-t-0";
          return position.symbol === "FPT" ? <Link key={position.symbol} href="/portfolio/FPT" className={className}>{content}</Link> : <div key={position.symbol} className={className}>{content}</div>;
        })}
      </div>
    </section>
  );
}

function DesktopHolding({ position, marketValue }: { position: PositionMetrics; marketValue: number }) {
  const profit = position.unrealizedPnl >= 0;
  return (
    <tr className={`h-[46px] border-t border-border-default ${position.symbol === "FPT" ? "bg-surface-subtle" : ""}`}>
      <td className="px-[14px]">{position.symbol === "FPT" ? <Link href="/portfolio/FPT" className="type-data-m text-primary">{position.symbol}</Link> : <span className="type-data-m text-primary">{position.symbol}</span>}</td>
      <td className="text-secondary">{position.quantity.toLocaleString("en-US")}</td>
      <td className="text-secondary">{formatCompactVnd(position.averageCost)}</td>
      <td className="text-secondary">{formatCompactVnd(position.last)}</td>
      <td className="text-secondary">{formatCompactVnd(position.marketValue)}</td>
      <td className={profit ? "text-profit" : "text-loss"}><span className="sr-only">{profit ? "Gain" : "Loss"}: </span>{formatCompactVnd(position.unrealizedPnl, true)}&nbsp;&nbsp;{formatSignedPercent(position.unrealizedPercent)}</td>
      <td className="text-secondary">{(position.marketValue / Math.max(1, marketValue) * 100).toFixed(1)}%</td>
    </tr>
  );
}
