import { notFound, redirect } from "next/navigation";

import { PositionDetail } from "@/components/portfolio/position-detail";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";

export default async function PositionDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const { symbol } = await params;
  if (symbol.toUpperCase() !== "FPT") notFound();

  return <AppShell user={user} current="portfolio"><PositionDetail symbol="FPT" /></AppShell>;
}
