import { notFound, redirect } from "next/navigation";

import { PositionDetail } from "@/components/portfolio/position-detail";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";
import { getPortfolioSnapshot } from "@/src/services/query.service";

export default async function PositionDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const { symbol } = await params;
  if (symbol.toUpperCase() !== "FPT") notFound();
  const snapshot = await getPortfolioSnapshot(user.id, user.name);
  if (!snapshot?.positions.FPT) notFound();

  return <AppShell user={user} current="portfolio"><PositionDetail symbol="FPT" snapshot={snapshot} /></AppShell>;
}
