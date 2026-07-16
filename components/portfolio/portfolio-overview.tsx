/* Hallmark · macrostructure: Stat-Led · genre: modern-minimal · theme: FinOps source-preserved · tone: technical
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * nav: N3 shared AppShell · footer: none · enrichment: none
 * contrast: pass (40–41) · slop: pass (42–45) · honest: pass (46) · chrome: pass (47)
 * tokens: pass (48) · responsive: pass (49) · icons: pass (30) · mobile: pass (34, 49–57)
 */

import Link from "next/link";

import { EquityBars } from "@/components/dashboard/equity-bars";
import { AllocationList } from "@/components/portfolio/allocation-list";
import { ActionLink } from "@/components/ui/action-link";
import { calculatePortfolio, formatCompactVnd, formatSignedPercent, type PositionMetrics } from "@/lib/portfolio";
import type { PortfolioSnapshot } from "@/server/services/query.service";

export function PortfolioOverview({ snapshot }: { snapshot: PortfolioSnapshot }) {
  const portfolio = calculatePortfolio(snapshot.positions, snapshot.cashBalance, snapshot.realizedPnl);
  const totalReturnTone = portfolio.totalReturn >= 0 ? "text-profit" : "text-loss";
  const unrealizedTone = portfolio.unrealizedPnl >= 0 ? "text-profit" : "text-loss";
  const buyingPowerPercent = snapshot.buyingPower / Math.max(1, portfolio.netAssetValue) * 100;

  return (
    <main className="min-w-0 p-4 pb-6 lg:p-6">
      <header className="grid min-w-0 gap-4 border-b border-border-default pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <h1 className="min-w-0 text-[24px] leading-8 font-semibold [overflow-wrap:anywhere] lg:text-[32px] lg:leading-10 lg:font-bold">Portfolio</h1>
          <p className="type-body-s mt-1 max-w-[65ch] text-secondary">Positions, allocation and performance across your mock account.</p>
        </div>
        <ActionLink href="/market/FPT" className="hidden active:translate-y-px lg:inline-flex">Trade FPT</ActionLink>
      </header>

      <section aria-labelledby="portfolio-value-title" className="mt-4 grid min-w-0 gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)] lg:gap-6">
        <article className="min-w-0 border-y border-border-default py-5 lg:py-7">
          <p className="type-label-m text-muted">NET PORTFOLIO VALUE</p>
          <p className="mt-2 min-w-0 font-[family-name:var(--font-data)] text-[clamp(2.5rem,6vw,5rem)] leading-none font-medium tracking-[-0.05em] text-primary [overflow-wrap:anywhere]">
            {formatCompactVnd(portfolio.netAssetValue)}
          </p>
          <h2 id="portfolio-value-title" className="mt-4 min-w-0 max-w-[28ch] text-[18px] leading-6 font-semibold text-primary [overflow-wrap:anywhere] lg:text-[24px] lg:leading-8">
            Capital at work across {portfolio.positions.length} open positions.
          </h2>
          <p className={`type-data-s mt-2 ${totalReturnTone}`}>
            <span className="sr-only">{portfolio.totalReturn >= 0 ? "Gain" : "Loss"}: </span>
            {formatCompactVnd(portfolio.totalReturn, true)} · {formatSignedPercent(portfolio.totalReturnPercent, 2)} all time
          </p>
        </article>

        <dl className="hidden border-y border-border-default lg:grid lg:grid-rows-4">
          <PortfolioStat label="Market value" value={formatCompactVnd(portfolio.marketValue)} supporting={`${portfolio.positions.length} open positions`} />
          <PortfolioStat label="Cash & buying power" value={formatCompactVnd(snapshot.buyingPower)} supporting={`${buyingPowerPercent.toFixed(1)}% available`} />
          <PortfolioStat label="Unrealized P&L" value={formatCompactVnd(portfolio.unrealizedPnl, true)} supporting={formatSignedPercent(portfolio.unrealizedPnl / Math.max(1, portfolio.costBasis) * 100, 2)} tone={unrealizedTone} />
          <PortfolioStat label="Realized P&L" value={formatCompactVnd(snapshot.realizedPnl, true)} supporting="Closed positions" tone={snapshot.realizedPnl >= 0 ? "text-profit" : "text-loss"} />
        </dl>
      </section>

      <div className="mt-4 lg:hidden">
        <AllocationList allocations={portfolio.allocations} mobile />
      </div>

      <section aria-label="Portfolio analysis" className="mt-6 hidden min-w-0 grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] gap-6 lg:grid">
        <figure className="min-w-0 border-y border-border-default py-5">
          <figcaption>
            <h2 className="type-heading-h3">Portfolio performance</h2>
            <p className="type-body-s mt-1 text-secondary">Simulated account equity</p>
          </figcaption>
          <div className="mt-4 h-[204px] min-w-0 overflow-hidden rounded-[var(--radius-control)] bg-canvas">
            <EquityBars count={22} chartWidth={680} start={12} blueCount={5} className="h-full" />
          </div>
        </figure>
        <AllocationList allocations={portfolio.allocations} />
      </section>

      <Holdings positions={portfolio.positions} marketValue={portfolio.marketValue} />
    </main>
  );
}

function PortfolioStat({ label, value, supporting, tone = "text-muted" }: { label: string; value: string; supporting: string; tone?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border-default py-3 first:border-t-0">
      <dt className="type-body-s text-secondary">{label}</dt>
      <dd className="text-right">
        <span className="type-data-m block text-primary">{value}</span>
        <span className={`type-data-s mt-1 block ${tone}`}>{supporting}</span>
      </dd>
    </div>
  );
}

function Holdings({ positions, marketValue }: { positions: PositionMetrics[]; marketValue: number }) {
  return (
    <section aria-labelledby="holdings-title" className="mt-6 min-w-0">
      <header className="flex items-end justify-between gap-4 border-b border-border-default pb-3">
        <div>
          <h2 id="holdings-title" className="type-heading-h3">Holdings</h2>
          <p className="type-body-s mt-1 hidden text-secondary lg:block">Current positions ranked by portfolio weight.</p>
        </div>
        <p className="type-data-s shrink-0 text-muted">{positions.length} positions</p>
      </header>

      <div className="hidden overflow-hidden border-b border-border-default lg:block">
        <table className="w-full table-fixed border-collapse type-data-s">
          <caption className="sr-only">Current portfolio holdings</caption>
          <thead className="h-11 text-left type-label-m text-secondary">
            <tr>
              <th className="w-[24%] px-3">Position</th>
              <th className="w-[15%]">Quantity</th>
              <th className="w-[15%]">Avg cost</th>
              <th className="w-[15%]">Market value</th>
              <th className="w-[21%]">Unrealized P&amp;L</th>
              <th className="w-[10%]">Weight</th>
            </tr>
          </thead>
          <tbody>{positions.map((position) => <DesktopHolding key={position.symbol} position={position} marketValue={marketValue} />)}</tbody>
        </table>
      </div>

      <div className="divide-y divide-border-default border-b border-border-default lg:hidden">
        {positions.map((position) => <MobileHolding key={position.symbol} position={position} />)}
      </div>
    </section>
  );
}

function MobileHolding({ position }: { position: PositionMetrics }) {
  const profit = position.unrealizedPnl >= 0;
  const content = (
    <>
      <span className="min-w-0">
        <span className="type-data-m block text-primary">{position.symbol}</span>
        <span className="type-data-s block truncate text-muted">{position.company} · {position.quantity.toLocaleString("en-US")} shares</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="type-data-s block text-secondary">{formatCompactVnd(position.marketValue)}</span>
        <span className={`type-data-s block ${profit ? "text-profit" : "text-loss"}`}>
          <span className="sr-only">{profit ? "Gain" : "Loss"}: </span>{formatSignedPercent(position.unrealizedPercent)}
        </span>
      </span>
    </>
  );
  const className = "flex min-h-[60px] items-center justify-between gap-4 px-3 py-2 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:shadow-[inset_3px_0_var(--color-focus)] active:bg-surface-raised";

  return position.symbol === "FPT"
    ? <Link href="/portfolio/FPT" className={className}>{content}</Link>
    : <div className={className}>{content}</div>;
}

function DesktopHolding({ position, marketValue }: { position: PositionMetrics; marketValue: number }) {
  const profit = position.unrealizedPnl >= 0;
  return (
    <tr className="h-[54px] border-t border-border-default first:border-t-0">
      <td className="px-3">
        {position.symbol === "FPT" ? (
          <Link href="/portfolio/FPT" className="inline-flex flex-col whitespace-nowrap text-primary underline decoration-border-strong underline-offset-4 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)] hover:text-brand focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)] active:text-brand">
            <span className="type-data-m">{position.symbol}</span>
            <span className="type-body-s max-w-full truncate text-muted no-underline">{position.company}</span>
          </Link>
        ) : (
          <span className="flex min-w-0 flex-col">
            <span className="type-data-m text-primary">{position.symbol}</span>
            <span className="type-body-s truncate text-muted">{position.company}</span>
          </span>
        )}
      </td>
      <td className="text-secondary">{position.quantity.toLocaleString("en-US")}</td>
      <td className="text-secondary">{formatCompactVnd(position.averageCost)}</td>
      <td className="text-secondary">{formatCompactVnd(position.marketValue)}</td>
      <td className={profit ? "text-profit" : "text-loss"}>
        <span className="sr-only">{profit ? "Gain" : "Loss"}: </span>{formatCompactVnd(position.unrealizedPnl, true)}&nbsp;&nbsp;{formatSignedPercent(position.unrealizedPercent)}
      </td>
      <td className="text-secondary">{(position.marketValue / Math.max(1, marketValue) * 100).toFixed(1)}%</td>
    </tr>
  );
}
