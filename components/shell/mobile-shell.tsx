import { Home, LineChart, List, PanelTop, Plus } from "lucide-react";

import { logoutDemoUser } from "@/app/login/actions";
import { Brand } from "@/components/brand";
import type { WorkspaceSection } from "@/components/shell/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import type { DemoUser } from "@/lib/session";
import Link from "next/link";

const items = [
  { label: "Home", icon: Home, section: "dashboard", href: "/dashboard" },
  { label: "Market", icon: LineChart, section: "market", href: "/market" },
  { label: "Trade", icon: Plus },
  { label: "Portfolio", icon: PanelTop, section: "portfolio", href: "/portfolio" },
  { label: "Orders", icon: List, section: "orders", href: "/orders" },
] as const;

export function MobileHeader({ user }: { user: DemoUser }) {
  return (
    <div className="shrink-0 lg:hidden">
      <div className="flex h-7 items-center justify-between px-[18px] type-data-s"><span>9:42</span><span className="text-secondary">5G&nbsp;&nbsp;100%</span></div>
      <header className="flex h-[62px] items-center justify-between border-b border-border-default px-4">
        <Brand markSize="small" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutDemoUser}>
            <button aria-label={`Sign out ${user.name}`} className="flex size-8 items-center justify-center rounded-full border border-border-default bg-surface-raised type-label-m text-secondary">{user.initials}</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export function MobileBottomNav({ current }: { current: WorkspaceSection }) {
  return (
    <nav aria-label="Mobile workspace" className="grid h-[72px] shrink-0 grid-cols-5 border-t border-border-default bg-surface px-2 py-2 lg:hidden">
      {items.map((item) => {
        const active = "section" in item && item.section === current;
        const href = "href" in item ? item.href : undefined;
        const content = <><item.icon aria-hidden="true" size={18} strokeWidth={2} />{item.label}</>;
        const className = `flex flex-col items-center justify-center gap-1 rounded-[10px] type-body-s ${active ? "bg-surface-raised text-profit" : "text-muted"}`;
        return href ? (
          <Link key={item.label} href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>
        ) : (
          <span key={item.label} aria-disabled="true" className={className}>{content}</span>
        );
      })}
    </nav>
  );
}
