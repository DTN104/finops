import { redirect } from "next/navigation";

import { OrdersScreen } from "@/components/orders/orders-screen";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";
import { getPortfolioSnapshot } from "@/server/services/query.service";

export default async function OrdersPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const snapshot = await getPortfolioSnapshot(user.id, user.name);
  if (!snapshot) redirect("/login");

  return <AppShell user={user} current="orders"><OrdersScreen role={user.role} actor={user.name} initialOrders={snapshot.orders} /></AppShell>;
}
