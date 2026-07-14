import Link from "next/link";

import { Brand } from "@/components/brand";
import type { WorkspaceSection } from "@/components/shell/app-shell";
import type { DemoUser } from "@/lib/session";

const navItems = [
  { label: "Dashboard", section: "dashboard", href: "/dashboard" },
  { label: "Market", section: "market", href: "/market" },
  { label: "Portfolio", section: "portfolio", href: "/portfolio" },
  { label: "Orders", section: "orders", href: "/orders" },
  { label: "Corporate Actions" },
  { label: "Audit Logs" },
  { label: "Performance Lab" },
] as const;

export function Sidebar({ user, current }: { user: DemoUser; current: WorkspaceSection }) {
  return (
    <aside className="hidden h-screen w-[232px] shrink-0 flex-col border-r border-border-default bg-surface px-[18px] py-6 lg:flex">
      <Brand markSize="small" />
      <p className="type-label-m mt-4 text-muted">WORKSPACE</p>
      <nav aria-label="Workspace" className="mt-4 flex flex-col gap-4">
        {navItems.map((item) => {
          const active = "section" in item && item.section === current;
          const href = "href" in item ? item.href : undefined;
          const content = (
            <>
              <span className={`h-5 w-[3px] rounded-full ${active ? "bg-brand" : "bg-[var(--finops-navy-700)]"}`} />
              <span>{item.label}</span>
            </>
          );
          return active ? (
            <Link key={item.label} href={href ?? "/dashboard"} aria-current="page" className="flex h-[42px] items-center gap-[10px] rounded-[10px] bg-surface-raised px-[10px] text-primary">
              {content}
            </Link>
          ) : href ? (
            <Link key={item.label} href={href} className="flex h-[42px] items-center gap-[10px] px-[10px] text-secondary transition-colors hover:text-primary">
              {content}
            </Link>
          ) : (
            <span key={item.label} aria-disabled="true" className="flex h-[42px] items-center gap-[10px] px-[10px] text-secondary">
              {content}
            </span>
          );
        })}
      </nav>
      <div className="mt-[142px] rounded-[10px] border border-border-default bg-surface-raised p-[14px]">
        <p className="type-label-m text-profit">{user.roleLabel.toUpperCase()}</p>
        <p className="mt-[7px]">{user.name}</p>
        <p className="type-body-s mt-[7px] text-muted">{user.role === "admin" ? "Admin role" : user.role === "trader" ? "Trader role" : "Viewer role"} • Mock data</p>
      </div>
    </aside>
  );
}
