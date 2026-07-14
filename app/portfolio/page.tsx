import { redirect } from "next/navigation";

import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";

export default async function PortfolioPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  return <AppShell user={user} current="portfolio"><PortfolioOverview /></AppShell>;
}
