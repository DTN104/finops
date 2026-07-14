"use client";

import Link from "next/link";
import { useMemo } from "react";

import { PositionPerformanceChart } from "@/components/portfolio/position-performance-chart";
import { usePortfolioStore } from "@/components/trading/portfolio-store";
import { calculatePortfolio, calculatePosition, formatCompactVnd, formatSignedPercent } from "@/lib/portfolio";

export function PositionDetail({ symbol }: { symbol: string }) {
  const positions = usePortfolioStore((state) => state.positions);
  const cashBalance = usePortfolioStore((state) => state.cashBalance);
  const realizedPnl = usePortfolioStore((state) => state.realizedPnl);
  const orders = usePortfolioStore((state) => state.orders);
  const portfolio = useMemo(() => calculatePortfolio(positions, cashBalance, realizedPnl), [cashBalance, positions, realizedPnl]);
  const position = positions[symbol];
  if (!position) return null;

  const metrics = calculatePosition(position);
  const lots = orders.filter((order) => order.symbol === symbol && order.side === "buy" && order.status === "FILLED").slice(0, 3);

  return (
    <main className="flex flex-col gap-[14px] p-4 lg:gap-[18px] lg:p-6">
      <header className="flex min-h-[78px] items-center justify-between lg:min-h-[82px]">
        <div>
          <p className="type-label-m text-muted">PORTFOLIO / POSITION</p>
          <h1 className="mt-1 text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">{symbol} position</h1>
          <p className="type-body-s text-secondary">{position.quantity.toLocaleString("en-US")} shares • {position.sector} • HOSE</p>
        </div>
        <div className="hidden gap-[10px] lg:flex">
          <Link href={`/market/${symbol}`} className="flex h-10 w-[148px] items-center justify-center rounded-[8px] border border-border-default bg-surface-raised type-label-l">Buy more</Link>
          <Link href={`/market/${symbol}`} className="flex h-10 w-[148px] items-center justify-center rounded-[8px] bg-loss type-label-l text-on-danger">Sell position</Link>
        </div>
      </header>

      <section aria-label={`${symbol} position metrics`} className="grid grid-cols-2 gap-[10px] lg:grid-cols-4 lg:gap-3">
        <PositionMetric label="Market value" value={formatCompactVnd(metrics.marketValue)} supporting={`${(metrics.marketValue / Math.max(1, portfolio.netAssetValue) * 100).toFixed(1)}% of portfolio`} />
        <PositionMetric label="Average cost" value={formatCompactVnd(position.averageCost)} supporting={`Cost basis ${formatCompactVnd(metrics.costBasis)}`} />
        <PositionMetric label="Unrealized P&L" value={formatCompactVnd(metrics.unrealizedPnl, true)} supporting={formatSignedPercent(metrics.unrealizedPercent)} profit={metrics.unrealizedPnl >= 0} />
        <PositionMetric label="Day P&L" value={formatCompactVnd(metrics.dayPnl, true)} supporting={`${formatSignedPercent(metrics.dayPercent, 2)} today`} profit={metrics.dayPnl >= 0} />
      </section>

      <section className="grid gap-[14px] lg:grid-cols-[minmax(0,760px)_minmax(300px,386px)]">
        <article className="h-[270px] rounded-[14px] border border-border-default bg-surface p-[14px] lg:h-[340px] lg:p-[18px]">
          <h2 className="type-heading-h3">Position performance</h2>
          <div className="mt-[14px] h-[200px] rounded-[12px] border border-border-default bg-canvas lg:h-[250px]"><PositionPerformanceChart /></div>
        </article>
        <article className="rounded-[14px] border border-border-default bg-surface p-[14px] lg:h-[340px] lg:p-[18px]">
          <h2 className="type-heading-h3">Tax lots</h2>
          <div>
            {lots.map((order) => {
              const returnPercent = ((position.last - order.limitPrice) / order.limitPrice) * 100;
              return (
                <div key={order.id} className="border-t border-border-default py-3 first:mt-0">
                  <div className="flex items-center justify-between"><span className="type-body-s text-secondary">{order.submittedDate}</span><span className="type-data-s text-profit">{formatSignedPercent(returnPercent)}</span></div>
                  <p className="type-data-s mt-[5px] text-muted">{order.quantity.toLocaleString("en-US")} shares&nbsp;&nbsp;•&nbsp;&nbsp;avg {formatCompactVnd(order.limitPrice)}</p>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[14px] border border-border-default bg-surface px-[14px] pt-[14px] pb-3 lg:px-[18px] lg:pt-[18px]">
        <h2 className="type-heading-h3">Recent activity</h2>
        <ActivityRow date="14 Jul 2026" action="Market value updated" quantity="—" amount={formatCompactVnd(metrics.marketValue)} />
        {lots.slice(0, 2).map((order) => <ActivityRow key={order.id} date={order.submittedDate} action="Buy filled" quantity={order.quantity.toLocaleString("en-US")} amount={`-${formatCompactVnd(order.quantity * order.limitPrice)}`} loss />)}
        <ActivityRow date="10 Jun 2026" action="Cash dividend" quantity={position.quantity.toLocaleString("en-US")} amount="+₫2.40M" profit />
      </section>

      <div className="grid grid-cols-2 gap-[10px] lg:hidden">
        <Link href={`/market/${symbol}`} className="flex h-12 items-center justify-center rounded-[8px] border border-border-default bg-surface-raised type-label-l">Buy more</Link>
        <Link href={`/market/${symbol}`} className="flex h-12 items-center justify-center rounded-[8px] bg-loss type-label-l text-on-danger">Sell</Link>
      </div>
    </main>
  );
}

function PositionMetric({ label, value, supporting, profit = false }: { label: string; value: string; supporting: string; profit?: boolean }) {
  return (
    <article className="h-[104px] rounded-[14px] border border-border-default bg-surface p-[14px] lg:h-[110px] lg:p-4">
      <p className="type-body-s text-secondary">{label}</p>
      <p className="type-data-l mt-[7px]">{value}</p>
      <p className={`type-data-s mt-[7px] ${profit ? "text-profit" : "text-muted"}`}>{supporting}</p>
    </article>
  );
}

function ActivityRow({ date, action, quantity, amount, profit = false, loss = false }: { date: string; action: string; quantity: string; amount: string; profit?: boolean; loss?: boolean }) {
  return (
    <div className="grid min-h-[38px] grid-cols-[100px_1fr_auto] items-center gap-3 border-t border-border-default lg:grid-cols-[190px_1fr_120px_160px]">
      <span className="type-data-s text-muted">{date}</span>
      <span className="type-body-s text-primary">{action}</span>
      <span className="type-data-s hidden text-secondary lg:block">{quantity}</span>
      <span className={`type-data-s text-right ${profit ? "text-profit" : loss ? "text-loss" : "text-primary"}`}>{amount}</span>
    </div>
  );
}
