"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CancelOrderDialog } from "@/components/orders/cancel-order-dialog";
import { Button, EmptyState } from "@/components/ui";
import { usePortfolioStore } from "@/components/trading/portfolio-store";
import type { DemoRole } from "@/lib/session";
import { canCancelOrder, isOrderActive, type MockOrder, type OrderStatus } from "@/lib/trading";

type OrderTab = "ALL" | "OPEN" | "FILLED" | "CANCELLED" | "REJECTED";

const desktopTabs: OrderTab[] = ["ALL", "OPEN", "FILLED", "CANCELLED", "REJECTED"];
const mobileTabs: OrderTab[] = ["OPEN", "FILLED", "CANCELLED"];

export function OrdersScreen({ role, actor }: { role: DemoRole; actor: string }) {
  const orders = usePortfolioStore((state) => state.orders);
  const cancelOrder = usePortfolioStore((state) => state.cancelOrder);
  const [tab, setTab] = useState<OrderTab>("OPEN");
  const [query, setQuery] = useState("");
  const [side, setSide] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesTab = tab === "ALL" || (tab === "OPEN" ? isOrderActive(order) : order.status === tab);
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || order.id.toLowerCase().includes(normalizedQuery) || order.symbol.toLowerCase().includes(normalizedQuery);
    return matchesTab && matchesQuery && (side === "all" || order.side === side) && (orderType === "all" || order.orderType === orderType);
  }), [orderType, orders, query, side, tab]);

  const selectedOrder = orders.find((order) => order.id === selectedId) ?? filteredOrders[0] ?? null;
  const activeCount = orders.filter((order) => order.status === "OPEN" || order.status === "PARTIAL").length;
  const cancellable = selectedOrder ? canCancelOrder(selectedOrder, role, actor) : false;

  const requestMobileCancel = (order: MockOrder) => {
    setSelectedId(order.id);
    if (canCancelOrder(order, role, actor)) setCancelOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedOrder) return;
    const cancelled = cancelOrder(selectedOrder.id, role, actor);
    setCancelOpen(false);
    setAnnouncement(cancelled ? `${selectedOrder.id} was cancelled` : `${selectedOrder.id} cannot be cancelled`);
  };

  return (
    <main className="p-4 lg:p-6">
      <header className="flex h-8 items-center justify-between lg:h-16">
        <div><h1 className="text-[24px] leading-8 font-semibold lg:text-[32px] lg:leading-10 lg:font-bold">Orders</h1><p className="type-body-s hidden text-secondary lg:block">Track mock orders throughout their execution lifecycle.</p></div>
        <p className="type-label-m text-profit lg:hidden">{activeCount} OPEN</p>
        <Link href="/market/FPT" className="hidden h-10 w-[148px] items-center justify-center rounded-[8px] bg-brand type-label-l text-on-brand lg:flex">New order</Link>
      </header>

      <OrderTabs tabs={desktopTabs} active={tab} onChange={setTab} className="mt-[18px] hidden lg:flex" />
      <OrderTabs tabs={mobileTabs} active={tab} onChange={setTab} className="mt-[14px] flex lg:hidden" />

      <div className="mt-[14px] hidden items-center gap-[10px] lg:flex">
        <label><span className="sr-only">Search orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID or symbol" className="h-10 w-[330px] rounded-[10px] border border-border-default bg-surface px-[14px] outline-none placeholder:text-muted focus:border-border-focus focus:shadow-[var(--focus-accent)]" /></label>
        <OrderSelect label="Order side" value={side} onChange={setSide} options={["all", "buy", "sell"]} />
        <OrderSelect label="Order type" value={orderType} onChange={setOrderType} options={["all", "LIMIT", "STOP"]} />
        <button disabled className="h-10 w-[148px] rounded-[8px] border border-border-default bg-surface-raised type-label-l disabled:opacity-100">Last 30 days</button>
      </div>

      <section className="mt-[14px] hidden overflow-hidden rounded-[14px] border border-border-default bg-surface lg:block">
        {filteredOrders.length ? (
          <table className="w-full table-fixed border-collapse type-data-s">
            <caption className="sr-only">Mock orders</caption>
            <thead className="h-11 bg-surface-raised text-left type-label-m text-secondary"><tr><th className="w-[17%] px-[14px]">Order ID</th><th className="w-[8%]">Symbol</th><th className="w-[8%]">Side</th><th className="w-[10%]">Type</th><th className="w-[9%]">Qty</th><th className="w-[11%]">Price</th><th className="w-[10%]">Filled</th><th className="w-[12%]">Status</th><th>Time</th></tr></thead>
            <tbody>{filteredOrders.map((order) => <OrderRow key={order.id} order={order} selected={selectedOrder?.id === order.id} onSelect={() => setSelectedId(order.id)} />)}</tbody>
          </table>
        ) : <EmptyState title="No matching orders" description="No orders match the selected filters." metadata="0 results" />}
      </section>

      <section className="mt-[14px] grid gap-[10px] lg:hidden">
        {filteredOrders.filter((order) => order.status !== "PENDING").slice(0, 5).map((order) => (
          <button key={order.id} type="button" onClick={() => requestMobileCancel(order)} className="h-[75px] rounded-[14px] border border-border-default bg-surface p-[14px] text-left focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]" aria-label={`${order.symbol} ${order.side} order, ${order.status}${canCancelOrder(order, role, actor) ? ", tap to review cancellation" : ""}`}>
            <span className="flex items-center justify-between"><span><span className="type-label-l">{order.symbol}</span><span className={`type-data-s ml-2 ${order.side === "buy" ? "text-profit" : "text-loss"}`}>{order.side.toUpperCase()}</span></span><OrderStatusText status={order.status} /></span>
            <span className="mt-[9px] flex items-center justify-between type-data-s text-muted"><span>#{order.id.slice(-4)} • {order.quantity.toLocaleString("en-US")} shares</span><span>@ ₫{order.limitPrice.toLocaleString("en-US")}</span></span>
          </button>
        ))}
        {!filteredOrders.length ? <EmptyState title="No matching orders" description="No orders match this status." metadata="0 results" /> : null}
      </section>

      {selectedOrder ? (
        <section className="mt-[18px] hidden min-h-[110px] items-start gap-[18px] rounded-[14px] border border-border-default bg-surface p-[18px] lg:flex">
          <div className="min-w-0 flex-1"><p className="type-label-m text-muted">SELECTED ORDER</p><h2 className="type-heading-h3 mt-[5px]">{selectedOrder.symbol} • {selectedOrder.side.toUpperCase()} {selectedOrder.quantity.toLocaleString("en-US")} @ ₫{selectedOrder.limitPrice.toLocaleString("en-US")}</h2><p className="type-data-s mt-[5px] text-secondary">{selectedOrder.id} • Submitted {selectedOrder.submittedAt} • Status {selectedOrder.status}</p></div>
          <div className="flex gap-[10px]">
            {selectedOrder.symbol === "FPT" ? <Link href="/market/FPT" className="flex h-10 w-[148px] items-center justify-center rounded-[8px] border border-border-default bg-surface-raised type-label-l">View details</Link> : <Button disabled variant="secondary" className="w-[148px]">View details</Button>}
            <Button variant="danger" disabled={!cancellable} onClick={() => setCancelOpen(true)} className="w-[148px]">{cancellable ? "Cancel order" : "Cannot cancel"}</Button>
          </div>
        </section>
      ) : null}

      <p className="sr-only" aria-live="polite">{announcement}</p>
      <CancelOrderDialog order={selectedOrder} open={cancelOpen} onKeep={() => setCancelOpen(false)} onCancel={confirmCancel} />
    </main>
  );
}

function OrderTabs({ tabs, active, onChange, className }: { tabs: OrderTab[]; active: OrderTab; onChange: (tab: OrderTab) => void; className: string }) {
  return <div role="tablist" aria-label="Order status" className={`w-fit gap-1 rounded-[10px] bg-surface p-1 ${className}`}>{tabs.map((tab) => <button key={tab} role="tab" aria-selected={active === tab} onClick={() => onChange(tab)} className={`rounded-[8px] px-4 py-2 type-label-m capitalize ${active === tab ? "bg-surface-raised text-primary" : "text-secondary"}`}>{tab.toLowerCase()}</button>)}</div>;
}

function OrderSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-[148px] rounded-[8px] border border-border-default bg-surface-raised px-4 type-label-l outline-none"><option value="all">All {label === "Order side" ? "sides" : "types"}</option>{options.filter((option) => option !== "all").map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}</select></label>;
}

function OrderRow({ order, selected, onSelect }: { order: MockOrder; selected: boolean; onSelect: () => void }) {
  return (
    <tr onClick={onSelect} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(); }} className={`h-[46px] cursor-pointer border-t border-border-default text-secondary focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--finops-border-focus)] ${selected ? "bg-surface-subtle" : ""}`}>
      <td className="px-[14px] type-data-m text-primary">{order.id}</td><td className="type-data-m text-primary">{order.symbol}</td><td className={order.side === "buy" ? "text-profit" : "text-loss"}>{order.side.toUpperCase()}</td><td>{order.orderType}</td><td>{order.quantity.toLocaleString("en-US")}</td><td>{order.limitPrice.toLocaleString("en-US")}</td><td>{order.filledQuantity.toLocaleString("en-US")}</td><td><OrderStatusText status={order.status} /></td><td>{order.submittedAt.slice(0, 5)}</td>
    </tr>
  );
}

function OrderStatusText({ status }: { status: OrderStatus }) {
  const className = status === "OPEN" || status === "FILLED" ? "text-profit" : status === "PARTIAL" || status === "PENDING" ? "text-warning" : status === "CANCELLED" ? "text-muted" : "text-loss";
  return <span className={`type-data-s ${className}`}>{status}</span>;
}
