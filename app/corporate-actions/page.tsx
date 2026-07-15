import { redirect } from "next/navigation";

import { CorporateActionsList } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function CorporateActionsPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  return <AppShell user={user} current="corporate-actions"><CorporateActionsList canManage={canManageOperations(user.role)} /></AppShell>;
}
