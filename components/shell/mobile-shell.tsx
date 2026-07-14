import { Home, LineChart, List, PanelTop, Plus } from "lucide-react";

import { logoutDemoUser } from "@/app/login/actions";
import { Brand } from "@/components/brand";
import type { DemoUser } from "@/lib/session";

const items = [
  { label: "Home", icon: Home, active: true },
  { label: "Market", icon: LineChart, active: false },
  { label: "Trade", icon: Plus, active: false },
  { label: "Portfolio", icon: PanelTop, active: false },
  { label: "Orders", icon: List, active: false },
] as const;

export function MobileHeader({ user }: { user: DemoUser }) {
  return (
    <div className="shrink-0 lg:hidden">
      <div className="flex h-7 items-center justify-between px-[18px] type-data-s"><span>9:42</span><span className="text-secondary">5G&nbsp;&nbsp;100%</span></div>
      <header className="flex h-[62px] items-center justify-between border-b border-border-default px-4">
        <Brand markSize="small" />
        <form action={logoutDemoUser}>
          <button aria-label={`Sign out ${user.name}`} className="flex size-8 items-center justify-center rounded-full border border-border-default bg-surface-raised type-label-m text-secondary">{user.initials}</button>
        </form>
      </header>
    </div>
  );
}

export function MobileBottomNav() {
  return (
    <nav aria-label="Mobile workspace" className="grid h-[72px] shrink-0 grid-cols-5 border-t border-border-default bg-surface px-2 py-2 lg:hidden">
      {items.map(({ label, icon: Icon, active }) => (
        <span key={label} aria-current={active ? "page" : undefined} aria-disabled={!active} className={`flex flex-col items-center justify-center gap-1 rounded-[10px] type-body-s ${active ? "bg-surface-raised text-profit" : "text-muted"}`}>
          <Icon aria-hidden="true" size={18} strokeWidth={2} />
          {label}
        </span>
      ))}
    </nav>
  );
}
