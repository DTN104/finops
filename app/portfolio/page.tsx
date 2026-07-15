import { redirect } from "next/navigation";

import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";
import { getPortfolioSnapshot } from "@/src/services/query.service";

export default async function PortfolioPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");
  const snapshot = await getPortfolioSnapshot(user.id, user.name);
  if (!snapshot) redirect("/login");

  return <AppShell user={user} current="portfolio"><PortfolioOverview snapshot={snapshot} /></AppShell>;
}
