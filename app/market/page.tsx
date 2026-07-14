import { redirect } from "next/navigation";

import { MarketTable } from "@/components/market/market-table";
import { AppShell } from "@/components/shell/app-shell";
import { getDemoSession } from "@/lib/session";

export default async function MarketPage() {
  const user = await getDemoSession();
  if (!user) redirect("/login");

  return (
    <AppShell user={user} current="market">
      <main className="p-4 lg:p-6">
        <header className="mb-[14px] flex items-center justify-between lg:mb-[18px]">
          <div>
            <h1 className="type-heading-h2 lg:text-[32px] lg:leading-10 lg:font-bold">Market</h1>
            <p className="type-body-s hidden text-secondary lg:block">Mock HOSE universe • Streaming quotes • 500 ms cadence</p>
          </div>
          <span className="type-label-m text-profit lg:rounded-full lg:bg-profit-bg lg:px-[10px] lg:py-[7px]">LIVE FEED</span>
        </header>
        <MarketTable />
      </main>
    </AppShell>
  );
}
