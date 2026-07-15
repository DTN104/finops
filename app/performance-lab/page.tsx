import { redirect } from "next/navigation";

import { PerformanceLab } from "@/components/performance/performance-lab";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";

export default async function PerformanceLabPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  return (
    <AppShell user={user} current="performance-lab">
      <PerformanceLab />
    </AppShell>
  );
}
