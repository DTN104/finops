import { redirect } from "next/navigation";

import { UserManagementScreen } from "@/components/operations/admin-screens";
import { AppShell } from "@/components/shell/app-shell";
import { canManageOperations, getDemoSession } from "@/lib/session";
import { getManagedUserViews } from "@/server/services/query.service";

export default async function UsersPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  if (!canManageOperations(user.role)) redirect("/dashboard");
  const users = await getManagedUserViews();
  return <AppShell user={user} current="users"><UserManagementScreen initialUsers={users} /></AppShell>;
}
