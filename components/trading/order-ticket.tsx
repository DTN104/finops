"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui";
import type { DemoRole } from "@/lib/session";
import { estimateOrder, formatVnd, validateOrder, type OrderDraft, type OrderEstimate, type OrderSide, type ValidationIssue } from "@/lib/trading";

interface OrderTicketProps {
  open: boolean;
  side: OrderSide;
  role: DemoRole;
  buyingPower: number;
  positionQuantity: number;
  averageCost: number;
  onSideChange: (side: OrderSide) => void;
  onClose: () => void;
  onReview: (draft: OrderDraft, estimate: OrderEstimate) => void;
}

function parseNumericInput(value: string): number {
  return Number(value.replaceAll(",", ""));
}

function ticketDefaults(side: OrderSide) {
  return side === "buy" ? { quantity: "1,000", price: "126,400" } : { quantity: "800", price: "126,300" };
}

export function OrderTicket({ open, side, role, buyingPower, positionQuantity, averageCost, onSideChange, onClose, onReview }: OrderTicketProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [quantity, setQuantity] = useState(ticketDefaults(side).quantity);
  const [price, setPrice] = useState(ticketDefaults(side).price);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [onClose, open]);

  const numericQuantity = parseNumericInput(quantity);
  const numericPrice = parseNumericInput(price);
  const estimate = useMemo(() => estimateOrder({ side, quantity: Number.isFinite(numericQuantity) ? numericQuantity : 0, limitPrice: Number.isFinite(numericPrice) ? numericPrice : 0 }, { buyingPower, positionQuantity, averageCost }), [averageCost, buyingPower, numericPrice, numericQuantity, positionQuantity, side]);

  if (!open) return null;

  const submitReview = () => {
    const result = validateOrder({ symbol: "FPT", side, quantity: numericQuantity, limitPrice: numericPrice, orderType: "LIMIT" }, { role, buyingPower, positionQuantity, averageCost });
    if (!result.success) {
      setIssues(result.issues);
      return;
    }
    onReview(result.draft, result.estimate);
  };

  const sideColor = side === "buy" ? "bg-brand text-on-brand" : "bg-loss text-on-danger";

  return (
    <div className="fixed inset-0 z-40 bg-scrim lg:left-[232px] lg:top-[72px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="order-ticket-title" className="absolute right-0 bottom-0 left-0 h-[560px] overflow-y-auto rounded-t-[24px] border border-border-default bg-surface-raised p-5 shadow-[var(--elevation-md)] outline-none lg:top-5 lg:right-10 lg:bottom-auto lg:left-auto lg:h-[850px] lg:w-[470px] lg:rounded-[20px] lg:p-7">
        <div className="mx-auto mb-[14px] h-[5px] w-12 rounded-full bg-border-strong lg:hidden" />
        <header className="flex items-start justify-between">
          <div className="flex w-full items-center justify-between lg:block">
            <h2 id="order-ticket-title" className="type-heading-h2">{side === "buy" ? "Buy FPT" : "Sell FPT"}</h2>
            <p className="type-data-s text-profit lg:mt-4">126,400&nbsp;&nbsp; +2.10%</p>
          </div>
          <button type="button" aria-label="Close order ticket" onClick={onClose} className="ml-4 hidden rounded text-muted focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)] lg:block"><X size={18} /></button>
        </header>

        {side === "sell" ? <p className="type-data-s mt-4 rounded-[10px] bg-surface px-3 py-[11px] text-info">Available to sell&nbsp; {positionQuantity.toLocaleString("en-US")} shares</p> : null}

        <div className="mt-4 hidden h-12 grid-cols-2 gap-2 rounded-[10px] bg-canvas p-[6px] lg:grid">
          {(["buy", "sell"] as const).map((candidate) => (
            <button key={candidate} type="button" onClick={() => onSideChange(candidate)} className={`rounded-[8px] capitalize ${side === candidate ? candidate === "buy" ? "bg-brand text-on-brand" : "bg-loss text-on-danger" : "text-secondary"}`}>{candidate}</button>
          ))}
        </div>

        <div className="mt-[14px] grid gap-[14px] lg:mt-[18px] lg:gap-[18px]">
          <label className="flex flex-col gap-[7px]">
            <span className="type-label-m uppercase text-muted">Order type</span>
            <span className="flex h-11 items-center rounded-[10px] border border-border-default bg-canvas px-3 type-data-m lg:h-12">Limit</span>
          </label>
          <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-1 lg:gap-[18px]">
            <label className="flex flex-col gap-[7px]">
              <span className="type-label-m uppercase text-muted">Quantity</span>
              <input inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-invalid={issues.some((issue) => issue.code === "quantity" || issue.code === "position") || undefined} className="h-11 rounded-[10px] border border-border-default bg-canvas px-3 type-data-m outline-none focus:border-border-focus focus:shadow-[var(--focus-accent)] lg:h-12" />
            </label>
            <label className="flex flex-col gap-[7px]">
              <span className="type-label-m uppercase text-muted">Limit price</span>
              <input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} aria-invalid={issues.some((issue) => issue.code === "price" || issue.code === "buying_power") || undefined} className="h-11 rounded-[10px] border border-border-default bg-canvas px-3 type-data-m outline-none focus:border-border-focus focus:shadow-[var(--focus-accent)] lg:h-12" />
            </label>
          </div>
        </div>

        <div className="mt-[14px] rounded-[12px] bg-surface p-3 lg:mt-[18px] lg:p-4">
          {side === "buy" ? (
            <>
              <EstimateRow label="Estimated value" value={formatVnd(estimate.gross)} />
              <EstimateRow label="Fee" value={formatVnd(estimate.fee)} />
              <EstimateRow label="Buying power after" value={formatVnd(estimate.buyingPowerAfter)} valueClass="text-profit" />
            </>
          ) : (
            <>
              <EstimateRow label="Estimated proceeds" value={formatVnd(estimate.gross)} />
              <EstimateRow label="Fee" value={`-${formatVnd(estimate.fee)}`} valueClass="text-loss" />
              <EstimateRow label="Estimated realized P&L" value={`+${formatVnd(estimate.realizedPnl)}`} valueClass="text-profit" />
              <EstimateRow label="Position remaining" value={`${estimate.positionRemaining.toLocaleString("en-US")} shares`} />
            </>
          )}
        </div>

        {issues.length ? <div role="alert" className="type-body-s mt-3 rounded-[10px] bg-loss-bg p-3 text-loss">{issues.map((issue) => <p key={`${issue.code}-${issue.message}`}>{issue.message}</p>)}</div> : null}

        <Button size="large" variant={side === "buy" ? "primary" : "danger"} onClick={submitReview} className={`mt-[14px] w-full lg:mt-[18px] ${sideColor}`}>{side === "buy" ? "Review order" : "Review sell order"}</Button>
        <Button size="large" variant="secondary" onClick={onClose} className="mt-3 hidden w-full lg:flex">Cancel</Button>
      </aside>
    </div>
  );
}

function EstimateRow({ label, value, valueClass = "text-primary" }: { label: string; value: string; valueClass?: string }) {
  return <div className="flex h-[30px] items-center justify-between"><span className="type-body-s text-secondary">{label}</span><span className={`type-data-s ${valueClass}`}>{value}</span></div>;
}
