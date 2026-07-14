import { redirect } from "next/navigation";

import { EquityBars } from "@/components/dashboard/equity-bars";
import { AppShell } from "@/components/shell/app-shell";
import { DataTable, type DataTableColumn } from "@/components/ui";
import { dashboardData, type Holding } from "@/lib/mock-data";
import { getDemoSession } from "@/lib/session";

const holdingColumns: readonly DataTableColumn<Holding>[] = [
  { key: "symbol", header: "Symbol", className: "w-[15%] text-primary", cell: (row) => row.symbol },
  { key: "quantity", header: "Quantity", className: "w-[14%]", cell: (row) => row.quantity },
  { key: "last", header: "Last", className: "w-[17%]", cell: (row) => row.last },
  { key: "value", header: "Market value", className: "w-[17%]", cell: (row) => row.value },
  { key: "return", header: "Return", className: "w-[12%]", cell: (row) => <span className={row.direction === "up" ? "text-profit" : "text-loss"}><span className="sr-only">{row.direction === "up" ? "Gain" : "Loss"}: </span>{row.return}</span> },
];

export default async function DashboardPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <main className="px-4 pb-6 pt-4 lg:px-6 lg:pb-10 lg:pt-6">
        <div className="flex h-[55px] items-center justify-between lg:h-16">
          <div>
            <p className="type-body-s text-secondary lg:hidden">Good morning, {user.name.split(" ")[0]}</p>
            <h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">Portfolio overview</h1>
            <p className="type-body-s hidden text-secondary lg:block">{dashboardData.asOf} • Prices update every 500 ms</p>
          </div>
          <span className="type-label-m text-profit lg:hidden">LIVE</span>
          <button disabled className="hidden h-10 w-[148px] rounded-[var(--radius-sm)] border border-border-default bg-surface-raised text-primary disabled:opacity-100 lg:block">Export report</button>
        </div>

        <section aria-label="Portfolio metrics" className="mt-[14px] grid grid-cols-2 gap-x-[10px] gap-y-[14px] lg:mt-[18px] lg:grid-cols-4 lg:gap-3">
          <article className="col-span-2 h-[130px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[18px] lg:col-span-1 lg:h-[110px] lg:rounded-[var(--radius-md)] lg:p-4">
            <p className="type-label-m text-muted lg:text-[13px] lg:leading-5 lg:font-normal lg:tracking-normal lg:normal-case">NET PORTFOLIO VALUE</p>
            <p className="mt-3 text-[32px] leading-10 font-bold lg:mt-1 lg:font-mono lg:text-[18px] lg:leading-6 lg:font-medium">₫1.284B</p>
            <p className="type-data-m mt-1 text-profit"><span className="sr-only">Gain: </span>+₫34.82M&nbsp;&nbsp; +2.79%</p>
          </article>
          {dashboardData.metrics.slice(1, 3).map((metric) => (
            <article key={metric.label} className="h-[100px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[14px] lg:h-[110px] lg:rounded-[var(--radius-md)] lg:p-4">
              <p className="text-secondary">{metric.label}</p>
              <p className="type-data-m mt-[7px] text-primary">{metric.value}</p>
              <p className={`type-data-s mt-[7px] ${metric.trend === "positive" ? "text-profit" : "text-muted"}`}>
                {metric.trend === "positive" && <span className="sr-only">Gain: </span>}{metric.supporting}
              </p>
            </article>
          ))}
          <article className="hidden h-[110px] rounded-[var(--radius-md)] border border-border-default bg-surface p-4 lg:block">
            <p className="type-body-s text-secondary">Open orders</p><p className="type-data-l mt-1">12</p><p className="type-data-s mt-[7px] text-warning">4 pending review</p>
          </article>
        </section>

        <section className="mt-[14px] grid gap-[14px] lg:mt-[18px] lg:grid-cols-[minmax(0,740px)_minmax(300px,406px)]">
          <article className="h-[188px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[14px] lg:h-[320px] lg:p-[18px]">
            <div className="flex items-center justify-between"><h2 className="text-[14px] leading-5 font-medium lg:text-[20px] lg:leading-7 lg:font-semibold">30-day equity curve</h2><span className="type-label-m hidden text-profit lg:block">30D</span></div>
            <div className="mt-[10px] h-[130px] rounded-[10px] bg-canvas lg:mt-[14px] lg:h-[220px]">
              <EquityBars compact className="h-full lg:hidden" />
              <EquityBars className="hidden h-full lg:block" />
            </div>
          </article>

          <article className="h-[156px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[14px] lg:h-[284px] lg:p-[18px]">
            <div className="flex h-5 items-center justify-between lg:h-7"><h2 className="text-[14px] leading-5 font-medium lg:text-[20px] lg:leading-7 lg:font-semibold">Watchlist</h2><span className="type-body-s hidden text-profit lg:block">View market</span></div>
            <div>
              {dashboardData.watchlist.map((quote, index) => (
                <div key={quote.symbol} className={`grid h-[38px] grid-cols-3 items-center border-t border-border-default type-data-s lg:h-11 ${index > 2 ? "hidden lg:grid" : ""}`}>
                  <span className="type-data-m text-primary">{quote.symbol}</span>
                  <span className="text-center text-secondary">{quote.price}</span>
                  <span className={`text-right ${quote.direction === "up" ? "text-profit" : "text-loss"}`}><span className="sr-only">{quote.direction === "up" ? "Gain" : "Loss"}: </span>{quote.change}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-[18px] hidden h-[210px] rounded-[var(--radius-md)] border border-border-default bg-surface p-[18px] lg:block">
          <div className="flex h-7 items-center justify-between"><h2 className="type-heading-h3">Top holdings</h2><span className="type-body-s text-profit">View portfolio →</span></div>
          <DataTable caption="Top portfolio holdings" columns={holdingColumns} rows={dashboardData.holdings} getRowKey={(row) => row.symbol} hideHeader />
        </section>
      </main>
    </AppShell>
  );
}
