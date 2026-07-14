import Link from "next/link";

export function Topbar() {
  return (
    <header className="hidden h-[72px] shrink-0 items-center justify-between border-b border-border-default px-6 lg:flex">
      <label className="sr-only" htmlFor="global-search">Search</label>
      <input id="global-search" disabled placeholder="Search symbol, order, or user..." className="h-10 w-[420px] rounded-[10px] border border-border-default bg-surface px-[14px] text-secondary placeholder:text-muted disabled:opacity-100" />
      <div className="flex items-center gap-[10px]">
        <span className="type-label-m rounded-full bg-profit-bg px-[10px] py-[6px] text-profit">MARKET OPEN</span>
        <span className="type-data-s text-muted">32 ms</span>
        <Link href="/market/FPT" className="flex h-10 w-[148px] items-center justify-center rounded-[var(--radius-sm)] border border-border-default bg-surface-raised text-primary">Quick trade</Link>
      </div>
    </header>
  );
}
