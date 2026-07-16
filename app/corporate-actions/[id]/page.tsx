import { redirect } from "next/navigation";

import { CorporateActionDetail } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";
import { getCorporateActionViews } from "@/server/services/query.service";

export default async function CorporateActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const { id } = await params;
  const canManage = canManageOperations(user.role);
  const action = (await getCorporateActionViews()).find((candidate) => candidate.id === id && (canManage || candidate.published)) ?? null;
  return <AppShell user={user} current="corporate-actions"><CorporateActionDetail action={action} canManage={canManage} /></AppShell>;
}
