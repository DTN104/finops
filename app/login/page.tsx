import { loginAsDemoUser } from "@/app/login/actions";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-canvas lg:grid lg:h-screen lg:grid-cols-2 lg:overflow-hidden">
      <div className="absolute top-[72px] right-6 z-10 lg:top-6"><ThemeToggle /></div>
      <section className="hidden h-full flex-col gap-7 bg-surface px-[72px] py-16 lg:flex">
        <Brand />
        <div className="h-[120px] shrink-0" />
        <p className="type-label-m text-profit">DEMO TRADING ENVIRONMENT</p>
        <h1 className="type-display-l max-w-[540px]">Trade the interface.<br />Not your money.</h1>
        <p className="type-body-l max-w-[530px] text-secondary">
          A deterministic paper-trading workspace designed to demonstrate professional frontend architecture,
          realtime rendering, validation, permissions and auditability.
        </p>
        <div className="w-full rounded-[var(--radius-lg)] border border-border-default bg-surface-raised p-[22px]">
          <h2 className="type-heading-h3">Demo Trader access</h2>
          <ul className="mt-[14px] space-y-[8px] text-secondary">
            <li>• View realtime market data</li>
            <li>• Submit mock buy and sell orders</li>
            <li>• Review portfolio and order history</li>
            <li>• No access to user administration</li>
          </ul>
        </div>
        <p className="type-body-s text-muted">All prices, balances, orders and identities are fictional.</p>
      </section>

      <section className="flex min-h-screen flex-col lg:items-center lg:justify-center">
        <div className="flex h-7 items-center justify-between px-[18px] type-data-s lg:hidden">
          <span>9:42</span><span className="text-secondary">5G&nbsp;&nbsp;100%</span>
        </div>
        <div className="px-6 pt-[46px] lg:hidden"><Brand /></div>
        <div className="mx-auto w-full max-w-[480px] px-6 pt-[66px] lg:h-[590px] lg:rounded-[20px] lg:border lg:border-border-default lg:bg-surface-raised lg:p-9">
          <div className="lg:hidden">
            <p className="type-label-m text-profit">DEMO TRADING ENVIRONMENT</p>
            <h1 className="mt-5 text-[32px] leading-[40px] font-bold">Trade the interface.<br />Not your money.</h1>
            <p className="type-body-l mt-4 text-secondary">A professional paper-trading workspace with deterministic mock data.</p>
          </div>
          <div className="hidden lg:block">
            <h1 className="type-heading-h1">Welcome back</h1>
            <p className="mt-3 text-secondary">Sign in to the FinOps paper-trading workspace.</p>
          </div>
          <LoginForm action={loginAsDemoUser} />
        </div>
      </section>
    </main>
  );
}
