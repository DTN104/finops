import { Brand } from "@/components/brand";
import { EquityBars } from "@/components/dashboard/equity-bars";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActionLink } from "@/components/ui/action-link";
import { dashboardData } from "@/lib/mock-data";

const previewMetrics = [
  { label: "Net value", value: "₫1.284B", detail: "+2.79%", tone: "profit" },
  { label: "Buying power", value: "₫486.2M", detail: "37.8% free", tone: "muted" },
  { label: "Open orders", value: "12", detail: "4 pending", tone: "warning" },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex h-[72px] items-center justify-between border-b border-border-default px-6 lg:h-[88px] lg:px-12">
        <Brand markSize="small" />
        <div className="flex items-center gap-7">
          <nav aria-label="Marketing" className="hidden items-center gap-7 text-secondary lg:flex">
            <span>Product</span>
            <span>Architecture</span>
            <span>Performance Lab</span>
          </nav>
          <ThemeToggle />
          <ActionLink href="/login" variant="secondary" size="medium" className="w-[112px] lg:w-[148px]">
            Sign in
          </ActionLink>
        </div>
      </header>

      <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-12 lg:h-[760px] lg:flex-row lg:items-center lg:gap-14 lg:px-12 lg:pt-16 lg:pb-10">
        <div className="flex flex-1 flex-col items-start gap-6 lg:h-[600px] lg:max-w-[610px]">
          <p className="type-label-m rounded-[var(--radius-sm)] bg-profit-bg px-[10px] py-[7px] text-profit">
            PAPER TRADING • ZERO REAL MONEY
          </p>
          <h1 className="text-[40px] leading-[48px] font-bold text-primary lg:text-[56px] lg:leading-[64px]">
            A portfolio project that trades like a real desk.
          </h1>
          <p className="type-body-l max-w-[570px] text-secondary">
            Explore realtime market tables, buy and sell flows, portfolio analytics,
            corporate actions, audit logs, role-based access and a 5,000-row
            performance lab—all powered by deterministic mock APIs.
          </p>
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <ActionLink href="/login" size="large" className="sm:w-[148px]">
              Start as Demo Trader
            </ActionLink>
            <ActionLink href="#architecture" variant="secondary" size="large" className="sm:w-[148px]">
              View architecture
            </ActionLink>
          </div>
          <div className="flex flex-wrap gap-[10px]">
            {["Mock market API", "Role-based access", "Auditable trade flow"].map((feature) => (
              <span key={feature} className="type-body-s rounded-full border border-border-default bg-surface px-3 py-[7px] text-secondary">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full rounded-[20px] border border-border-default bg-surface-raised p-5 lg:h-[610px] lg:w-[650px] lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="type-heading-h3">Portfolio overview</h2>
            <span className="type-data-s text-profit">LIVE&nbsp;&nbsp;09:42:18</span>
          </div>
          <div className="mt-[18px] grid grid-cols-1 gap-[10px] sm:grid-cols-3">
            {previewMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[var(--radius-md)] border border-border-default bg-surface p-[14px]">
                <p className="type-body-s text-muted">{metric.label}</p>
                <p className="type-data-m mt-2">{metric.value}</p>
                <p className={`type-data-s mt-2 ${metric.tone === "profit" ? "text-profit" : metric.tone === "warning" ? "text-warning" : "text-muted"}`}>
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-[18px] rounded-[14px] border border-border-default bg-canvas p-4">
            <p className="type-body-s text-secondary">30-day equity curve</p>
            <EquityBars className="mt-[14px] h-[160px]" count={20} chartWidth={560} start={0} blueCount={6} />
          </div>
          <div className="mt-[6px]">
            {dashboardData.watchlist.slice(0, 3).map((quote) => (
              <div key={quote.symbol} className="grid grid-cols-3 border-t border-border-default py-3 type-data-s">
                <span className="font-medium text-primary">{quote.symbol}</span>
                <span className="text-center text-secondary">{quote.price}</span>
                <span className={`text-right ${quote.direction === "up" ? "text-profit" : "text-loss"}`}>
                  <span className="sr-only">{quote.direction === "up" ? "Gain" : "Loss"}: </span>{quote.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="architecture" className="flex min-h-[176px] flex-col justify-center gap-4 bg-surface px-6 text-secondary lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p>Built to demonstrate frontend architecture, rendering performance and product thinking.</p>
        <p className="type-data-s text-muted">NEXT.JS&nbsp;&nbsp;•&nbsp;&nbsp;TYPESCRIPT&nbsp;&nbsp;•&nbsp;&nbsp;MOCK APIs</p>
      </footer>
    </main>
  );
}
