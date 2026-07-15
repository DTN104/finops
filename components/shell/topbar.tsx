import Link from "next/link";
import type { WorkspaceSection } from "@/components/shell/app-shell";

export function Topbar({ current }: { current: WorkspaceSection }) {
  const corporate = current === "corporate-actions";
  const admin = current === "audit-logs" || current === "users" || current === "settings";
  return (
    <header className="hidden h-[72px] shrink-0 items-center justify-between border-b border-border-default px-6 lg:flex">
      <label className="sr-only" htmlFor="global-search">Search</label>
      <input id="global-search" disabled placeholder={admin ? "Search logs, users, or resources..." : corporate ? "Search event, symbol, or user..." : "Search symbol, order, or user..."} className="h-10 w-[420px] rounded-[10px] border border-border-default bg-surface px-[14px] text-secondary placeholder:text-muted disabled:opacity-100" />
      <div className="flex items-center gap-[10px]">
        <span className="type-label-m rounded-full bg-profit-bg px-[10px] py-[6px] text-profit">{admin ? "AUDIT ENABLED" : corporate ? "EVENT FEED SYNCED" : "MARKET OPEN"}</span>
        <span className="type-data-s text-muted">{admin ? "Admin session • 18m" : corporate ? "09:42:18" : "32 ms"}</span>
        {!admin && !corporate ? <Link href="/market/FPT" className="flex h-10 w-[148px] items-center justify-center rounded-[var(--radius-sm)] border border-border-default bg-surface-raised text-primary">Quick trade</Link> : null}
      </div>
    </header>
  );
}
