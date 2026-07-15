import Link from "next/link";

import { Brand } from "@/components/brand";
import type { WorkspaceSection } from "@/components/shell/app-shell";
import type { DemoUser } from "@/lib/session";

const navItems = [
  { label: "Dashboard", section: "dashboard", href: "/dashboard" },
  { label: "Market", section: "market", href: "/market" },
  { label: "Portfolio", section: "portfolio", href: "/portfolio" },
  { label: "Orders", section: "orders", href: "/orders" },
  { label: "Corporate Actions", section: "corporate-actions", href: "/corporate-actions" },
] as const;

const performanceItem = { label: "Performance Lab", section: "performance-lab", href: "/performance-lab" } as const;

export function Sidebar({ user, current }: { user: DemoUser; current: WorkspaceSection }) {
  const engineering = current === "performance-lab";
  const administration = user.role === "admin" && current !== "corporate-actions" && !engineering;
  const items = administration ? [
    ...navItems,
    { label: "Audit Logs", section: "audit-logs", href: "/admin/audit-logs" },
    { label: "User Management", section: "users", href: "/admin/users" },
    { label: "Settings", section: "settings", href: "/admin/settings" },
    performanceItem,
  ] as const : user.role === "admin" ? [
    ...navItems,
    { label: "Audit Logs", section: "audit-logs", href: "/admin/audit-logs" },
    performanceItem,
  ] as const : [...navItems, performanceItem] as const;

  return (
    <aside className="hidden h-screen w-[232px] shrink-0 flex-col border-r border-border-default bg-surface px-[18px] py-6 lg:flex">
      <Brand markSize="small" />
      <p className="type-label-m mt-4 text-muted">{engineering ? "ENGINEERING" : administration ? "ADMINISTRATION" : "WORKSPACE"}</p>
      <nav aria-label="Workspace" className="mt-4 flex flex-col gap-[10px]">
        {items.map((item) => {
          const active = item.section === current;
          const href = item.href;
          const content = (
            <>
              <span className={`h-5 w-[3px] rounded-full ${active ? "bg-brand" : "bg-[var(--finops-navy-700)]"}`} />
              <span>{item.label}</span>
            </>
          );
          return active ? (
            <Link key={item.label} href={href} aria-current="page" className="flex h-[42px] items-center gap-[10px] rounded-[10px] bg-surface-raised px-[10px] text-primary">
              {content}
            </Link>
          ) : (
            <Link key={item.label} href={href} className="flex h-[42px] items-center gap-[10px] px-[10px] text-secondary transition-colors hover:text-primary">
              {content}
            </Link>
          );
        })}
      </nav>
      {engineering ? (
        <div className="mt-auto rounded-[10px] border border-border-default bg-surface-raised p-[14px]">
          <p className="type-label-m text-profit">LAB RUNNING</p>
          <p className="mt-[7px]">Chrome • M2 simulation</p>
          <p className="type-data-s mt-[7px] text-muted">60 Hz • Mock websocket</p>
        </div>
      ) : (
        <div className="mt-auto rounded-[10px] border border-border-default bg-surface-raised p-[14px]">
          <p className="type-label-m text-profit">{user.roleLabel.toUpperCase()}</p>
          <p className="mt-[7px]">{user.name}</p>
          <p className="type-body-s mt-[7px] text-muted">{administration ? "Full demo permissions" : (user.role === "admin" ? "Admin role" : user.role === "trader" ? "Trader role" : "Viewer role") + " • Mock data"}</p>
        </div>
      )}
    </aside>
  );
}
