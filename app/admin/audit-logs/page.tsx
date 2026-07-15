import { redirect } from "next/navigation";

import { AuditLogsScreen } from "@/components/operations/admin-screens";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function AuditLogsPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  if (!canManageOperations(user.role)) redirect("/dashboard");
  return <AppShell user={user} current="audit-logs"><AuditLogsScreen /></AppShell>;
}
