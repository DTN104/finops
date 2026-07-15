import { redirect } from "next/navigation";

import { CorporateActionForm } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function EditCorporateActionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  if (!canManageOperations(user.role)) redirect("/corporate-actions");
  const { id } = await params;
  return <AppShell user={user} current="corporate-actions"><CorporateActionForm actor={user.name} id={id} /></AppShell>;
}
