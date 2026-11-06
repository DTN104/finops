/* Hallmark · genre: modern-minimal · macrostructure: Map / Diagram · theme: FinOps source-preserved · enrichment: none · nav: preserved · footer: preserved
 * pre-emit critique: P5 H5 E4 S5 R5 V5
 */
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

const architectureLayers = [
  {
    label: "Presentation",
    summary: "Routes, shared UI and focused client-side interaction.",
    className: "border-info bg-info-bg",
    labelClassName: "text-info",
    modules: [
      ["App Router", "app/"],
      ["Shared UI", "components/ui"],
      ["Market UI", "components/market"],
      ["Performance Lab", "components/performance"],
    ],
  },
  {
    label: "Application",
    summary: "Server workflows, validation and permission gates.",
    className: "border-border-default bg-canvas",
    labelClassName: "text-info",
    modules: [
      ["Session", "lib/session.ts"],
      ["Queries", "server/services/query.service.ts"],
      ["Mutations", "server/services/mutation.ts"],
      ["Validation", "Zod schemas"],
    ],
  },
  {
    label: "Domain",
    summary: "Financial rules remain independent from rendering.",
    className: "border-border-default bg-canvas",
    labelClassName: "text-primary",
    modules: [
      ["Trading rules", "lib/trading.ts"],
      ["Portfolio model", "lib/portfolio.ts"],
      ["Operations", "lib/operations.ts"],
      ["RBAC", "DemoRole policy"],
    ],
  },
  {
    label: "Infrastructure",
    summary: "Persistence, deterministic data and immutable audit history.",
    className: "border-profit bg-profit-bg",
    labelClassName: "text-profit",
    modules: [
      ["Repositories", "server/repositories"],
      ["Drizzle schema", "server/db/schema"],
      ["PostgreSQL", "finops schema"],
      ["Seeded data", "server/db/seed.ts"],
    ],
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas">
      <header className="flex h-[72px] items-center justify-between border-b border-border-default px-6 lg:h-[88px] lg:px-12">
        <Brand markSize="small" />
        <div className="flex items-center gap-7">
          <nav aria-label="Marketing" className="hidden items-center gap-7 text-secondary lg:flex">
            <span>Product</span>
            <a href="#architecture" className="whitespace-nowrap rounded-sm transition-colors duration-[var(--dur-micro)] ease-[var(--ease-out)] hover:text-primary active:text-profit focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]">Architecture</a>
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

      <section id="architecture" aria-labelledby="architecture-title" className="scroll-mt-8 border-t border-border-default bg-surface px-6 py-14 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1344px]">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-16">
            <h2 id="architecture-title" className="type-display-l min-w-0 [overflow-wrap:anywhere] text-primary">System architecture</h2>
            <div className="min-w-0">
              <p className="type-body-l max-w-[68ch] text-secondary">A server-first Next.js application that keeps presentation, financial rules and persistence separate—without hiding the request path behind unnecessary abstractions.</p>
              <p className="type-data-s mt-4 text-profit">Browser → Server Component → Server Action → PostgreSQL → Audit log</p>
            </div>
          </div>

          <ol aria-label="Application architecture layers" className="mt-10 flex flex-col gap-3">
            {architectureLayers.map((layer) => (
              <li key={layer.label} className={`grid min-w-0 overflow-hidden rounded-[var(--radius-card)] border lg:grid-cols-[260px_minmax(0,1fr)] lg:items-stretch ${layer.className}`}>
                <div className="min-w-0">
                  <div className="p-4">
                    <h3 className={`type-label-m ${layer.labelClassName}`}>{layer.label.toUpperCase()}</h3>
                    <p className="type-heading-h3 mt-2 min-w-0 [overflow-wrap:anywhere] text-primary">{layer.summary}</p>
                  </div>
                </div>
                <ul className="grid min-w-0 grid-cols-1 gap-px border-t border-border-default bg-border-default sm:grid-cols-2 lg:border-t-0 lg:border-l xl:grid-cols-4">
                  {layer.modules.map(([name, path]) => (
                    <li key={name} className="min-w-0 bg-surface-raised p-3">
                      <p className="font-medium text-primary">{name}</p>
                      <p className="type-data-s mt-1 min-w-0 [overflow-wrap:anywhere] text-muted">{path}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-4 grid overflow-hidden rounded-[var(--radius-card)] border border-border-default bg-canvas lg:grid-cols-2">
            <article className="min-w-0 p-5">
              <h3 className="type-heading-h3">Authentication &amp; RBAC</h3>
              <p className="type-data-s mt-3 leading-6 text-secondary">HTTP-only session → server permission check → route guard → UI capability gate</p>
            </article>
            <article className="min-w-0 border-t border-border-default p-5 lg:border-t-0 lg:border-l">
              <h3 className="type-heading-h3">Trading mutation</h3>
              <p className="type-data-s mt-3 leading-6 text-secondary">Order ticket → Zod validation → database transaction → audit event → route revalidation</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="flex min-h-[176px] flex-col justify-center gap-4 bg-surface px-6 text-secondary lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <p>Built to demonstrate frontend architecture, rendering performance and product thinking.</p>
        <p className="type-data-s text-muted">NEXT.JS&nbsp;&nbsp;•&nbsp;&nbsp;TYPESCRIPT&nbsp;&nbsp;•&nbsp;&nbsp;MOCK APIs</p>
      </footer>
    </main>
  );
}
