"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui";
import { CandlestickChart } from "@/components/trading/candlestick-chart";
import { OrderBook } from "@/components/trading/order-book";
import { OrderConfirmationDialog, OrderSuccessDialog, type PreparedOrder } from "@/components/trading/order-dialogs";
import { OrderTicket } from "@/components/trading/order-ticket";
import { usePortfolioStore } from "@/components/trading/portfolio-store";
import type { DemoRole } from "@/lib/session";
import { canPlaceOrders, validateOrder, type MockOrder, type OrderSide } from "@/lib/trading";

const stats = [
  { label: "Open", value: "124,800", mobile: true },
  { label: "High", value: "127,200", mobile: true },
  { label: "Low", value: "123,900", mobile: false },
  { label: "Prev close", value: "123,800", mobile: false },
  { label: "Volume", value: "5.84M", mobile: true },
  { label: "Market cap", value: "₫176.2T", mobile: false },
] as const;

type FlowStage = "closed" | "ticket" | "confirm" | "success";

export function StockDetail({ role, actor }: { role: DemoRole; actor: string }) {
  const router = useRouter();
  const buyingPower = usePortfolioStore((state) => state.buyingPower);
  const position = usePortfolioStore((state) => state.positions.FPT);
  const submitOrder = usePortfolioStore((state) => state.submitOrder);
  const [side, setSide] = useState<OrderSide>("buy");
  const [stage, setStage] = useState<FlowStage>("closed");
  const [prepared, setPrepared] = useState<PreparedOrder | null>(null);
  const [submitted, setSubmitted] = useState<MockOrder | null>(null);
  const permitted = canPlaceOrders(role);

  const openTicket = (nextSide: OrderSide) => {
    if (!permitted) return;
    setSide(nextSide);
    setPrepared(null);
    setSubmitted(null);
    setStage("ticket");
  };

  const confirmOrder = () => {
    if (!prepared) return;
    const current = usePortfolioStore.getState();
    const currentPosition = current.positions.FPT;
    const validation = validateOrder(prepared.draft, {
      role,
      buyingPower: current.buyingPower,
      positionQuantity: currentPosition.quantity,
      averageCost: currentPosition.averageCost,
    });
    if (!validation.success) {
      setStage("ticket");
      return;
    }
    const order = submitOrder(validation.draft, role, actor);
    setSubmitted(order);
    setStage("success");
  };

  return (
    <>
      <main className="flex flex-col gap-[14px] p-4 lg:gap-4 lg:p-6">
        <header className="relative flex h-[55px] items-center justify-between lg:h-[66px]">
          <div>
            <div className="flex items-center gap-[10px]"><h1 className="type-heading-h2 lg:text-[32px] lg:leading-10 lg:font-bold">FPT</h1><span className="type-label-m hidden rounded-full bg-surface px-2 py-[5px] text-muted lg:block">HOSE</span></div>
            <p className="type-body-s text-muted lg:text-[14px] lg:leading-[22px]">FPT Corporation • <span className="lg:hidden">HOSE</span><span className="hidden lg:inline">Technology</span></p>
          </div>
          <div className="text-right lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <p className="type-data-l">126,400</p>
            <p className="type-data-s mt-[3px] text-profit"><span className="hidden lg:inline">+2,600&nbsp;&nbsp; </span>+2.10%</p>
          </div>
          <div className="hidden gap-[10px] lg:flex">
            <Button size="large" variant="secondary" disabled={!permitted} onClick={() => openTicket("sell")} className="w-[148px]">Sell</Button>
            <Button size="large" disabled={!permitted} onClick={() => openTicket("buy")} className="w-[148px]">Buy FPT</Button>
          </div>
        </header>

        <section className="grid h-[258px] lg:h-[430px] lg:grid-cols-[minmax(0,760px)_minmax(300px,386px)] lg:gap-[14px]">
          <div className="h-full rounded-[14px] border border-border-default bg-surface p-[14px] lg:p-[18px]">
            <div className="hidden h-7 items-center justify-between lg:flex"><h2 className="type-heading-h3">Price chart</h2><span className="type-data-s text-muted">1D&nbsp;&nbsp;1W&nbsp;&nbsp;1M&nbsp;&nbsp;3M&nbsp;&nbsp;1Y</span></div>
            <CandlestickChart className="h-[230px] lg:mt-[14px] lg:h-[320px]" />
          </div>
          <OrderBook />
        </section>

        <section aria-label="FPT key statistics" className="grid h-[67px] grid-cols-3 gap-2 lg:h-[75px] lg:grid-cols-6 lg:gap-3">
          {stats.map((stat) => (
            <article key={stat.label} className={`${stat.mobile ? "" : "hidden lg:block"} rounded-[12px] border border-border-default bg-surface px-[10px] py-3 lg:px-[14px] lg:py-[14px]`}>
              <p className="type-body-s text-muted">{stat.label}</p>
              <p className="type-data-s mt-[5px] text-primary lg:text-[14px] lg:leading-5 lg:font-medium">{stat.value}</p>
            </article>
          ))}
        </section>

        <section className="h-[74px] rounded-[14px] border border-border-default bg-surface p-[14px] lg:grid lg:h-20 lg:grid-cols-[128px_repeat(4,1fr)] lg:items-center lg:p-[18px]">
          <h2 className="type-label-l lg:text-[20px] lg:leading-7 lg:font-semibold">Your position</h2>
          <div className="mt-2 flex items-center justify-between lg:mt-0 lg:block"><span className="type-data-s text-secondary lg:hidden">{position.quantity.toLocaleString("en-US")} shares</span><PositionValue label="Quantity" value={position.quantity.toLocaleString("en-US")} /></div>
          <PositionValue label="Average cost" value="₫112,100" />
          <PositionValue label="Market value" value="₫303.36M" />
          <div className="hidden lg:block"><PositionValue label="Unrealized P&L" value="+₫34.32M   +12.8%" profit /></div>
          <span className="type-data-s text-profit lg:hidden">+₫34.32M&nbsp;&nbsp; +12.8%</span>
        </section>

        <div className="grid grid-cols-2 gap-[10px] lg:hidden">
          <Button size="large" variant="secondary" disabled={!permitted} onClick={() => openTicket("sell")} className="w-full">Sell</Button>
          <Button size="large" disabled={!permitted} onClick={() => openTicket("buy")} className="w-full">Buy</Button>
        </div>
        {!permitted ? <p role="note" className="type-body-s text-center text-warning">Viewer role is read-only. Switch to Trader to place mock orders.</p> : null}
      </main>

      <OrderTicket
        key={`${side}-${stage === "ticket" ? "open" : "closed"}`}
        open={stage === "ticket"}
        side={side}
        role={role}
        buyingPower={buyingPower}
        positionQuantity={position.quantity}
        averageCost={position.averageCost}
        onSideChange={setSide}
        onClose={() => setStage("closed")}
        onReview={(draft, estimate) => { setPrepared({ draft, estimate }); setStage("confirm"); }}
      />
      <OrderConfirmationDialog order={prepared} open={stage === "confirm"} onBack={() => setStage("ticket")} onConfirm={confirmOrder} />
      <OrderSuccessDialog
        order={submitted}
        open={stage === "success"}
        onPrimary={() => router.push("/dashboard")}
        onSecondary={() => router.push(side === "buy" ? "/market" : "/dashboard")}
      />
    </>
  );
}

function PositionValue({ label, value, profit = false }: { label: string; value: string; profit?: boolean }) {
  return (
    <div className="hidden lg:block">
      <p className="type-body-s text-muted">{label}</p>
      <p className={`type-data-s mt-1 ${profit ? "text-profit" : "text-primary"}`}>{value}</p>
    </div>
  );
}
