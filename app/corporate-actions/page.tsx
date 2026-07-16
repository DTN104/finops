import { redirect } from "next/navigation";

import { CorporateActionsList } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";
import { getCorporateActionViews } from "@/server/services/query.service";

export default async function CorporateActionsPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const actions = await getCorporateActionViews();
  return <AppShell user={user} current="corporate-actions"><CorporateActionsList canManage={canManageOperations(user.role)} actions={actions} /></AppShell>;
}
