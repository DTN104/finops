import type { ReactNode } from "react";

import { MobileBottomNav, MobileHeader } from "@/components/shell/mobile-shell";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import type { DemoUser } from "@/lib/session";

export type WorkspaceSection = "dashboard" | "market" | "portfolio" | "orders";

export function AppShell({ user, children, current = "dashboard" }: { user: DemoUser; children: ReactNode; current?: WorkspaceSection }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar user={user} current={current} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <MobileHeader user={user} />
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
        <MobileBottomNav current={current} />
      </div>
    </div>
  );
}
