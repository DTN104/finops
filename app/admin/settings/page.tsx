import { redirect } from "next/navigation";

import { SettingsScreen } from "@/components/operations/admin-screens";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  if (!canManageOperations(user.role)) redirect("/dashboard");
  return <AppShell user={user} current="settings"><SettingsScreen actor={user.name} /></AppShell>;
}
