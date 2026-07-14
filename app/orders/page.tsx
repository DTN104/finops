import { redirect } from "next/navigation";

import { OrdersScreen } from "@/components/orders/orders-screen";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";

export default async function OrdersPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  return <AppShell user={user} current="orders"><OrdersScreen role={user.role} actor={user.name} /></AppShell>;
}
