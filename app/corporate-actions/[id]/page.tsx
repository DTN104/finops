import { redirect } from "next/navigation";

import { CorporateActionDetail } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function CorporateActionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const { id } = await params;
  return <AppShell user={user} current="corporate-actions"><CorporateActionDetail id={id} canManage={canManageOperations(user.role)} /></AppShell>;
}
