import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { StockDetail } from "@/components/trading/stock-detail";
import { getDemoSession } from "@/lib/session";

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const { symbol } = await params;
  if (symbol.toUpperCase() !== "FPT") notFound();

  return (
    <AppShell user={user} current="market">
      <StockDetail role={user.role} actor={user.name} />
    </AppShell>
  );
}
