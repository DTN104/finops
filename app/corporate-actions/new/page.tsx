import { redirect } from "next/navigation";

import { CorporateActionForm } from "@/components/operations/corporate-actions-screen";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function NewCorporateActionPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  if (!canManageOperations(user.role)) redirect("/corporate-actions");
  return <AppShell user={user} current="corporate-actions"><CorporateActionForm /></AppShell>;
}
