"use client";

import { Check } from "lucide-react";

import { Button, Dialog } from "@/components/ui";
import { formatVnd, type MockOrder, type OrderDraft, type OrderEstimate } from "@/lib/trading";

export interface PreparedOrder {
  draft: OrderDraft;
  estimate: OrderEstimate;
}

export function OrderConfirmationDialog({ order, open, onBack, onConfirm }: { order: PreparedOrder | null; open: boolean; onBack: () => void; onConfirm: () => void }) {
  if (!order) return null;
  const sell = order.draft.side === "sell";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onBack(); }} title={sell ? "Confirm sell order" : "Confirm buy order"} className="max-h-[calc(100dvh-32px)] p-6 lg:h-[690px] lg:-translate-y-[55px] lg:p-8">
      <p className={`type-label-m ${sell ? "text-loss" : "text-warning"}`}>{sell ? "REVIEW SELL ORDER" : "REVIEW ORDER"}</p>
      <h2 className="type-heading-h2 mt-4 lg:text-[32px] lg:leading-10 lg:font-bold">Confirm {sell ? "sell" : "buy"} order</h2>
      <p className="mt-3 text-secondary">{sell ? "The simulated order will reduce your FPT position if filled. No real securities are involved." : "This is a paper-trading order. No real funds or securities are involved."}</p>

      <div className="mt-5 rounded-[14px] border border-border-default bg-surface p-[18px]">
        <SummaryRow label="Symbol" value="FPT" />
        <SummaryRow label="Side" value={sell ? "SELL" : "BUY"} valueClass={sell ? "text-loss" : "text-profit"} />
        <SummaryRow label="Order type" value="LIMIT" />
        <SummaryRow label="Quantity" value={order.draft.quantity.toLocaleString("en-US")} />
        <SummaryRow label="Limit price" value={formatVnd(order.draft.limitPrice)} />
        <SummaryRow label={sell ? "Estimated proceeds" : "Estimated total"} value={formatVnd(sell ? order.estimate.proceeds : order.estimate.total)} valueClass={sell ? "text-profit" : "text-primary"} />
        {sell ? <SummaryRow label="Position remaining" value={`${order.estimate.positionRemaining.toLocaleString("en-US")} shares`} /> : null}
      </div>

      <div className="type-body-s mt-[18px] rounded-[12px] bg-warning-bg px-4 py-3 text-warning">
        <p className="font-medium">{sell ? "Price may move before execution" : "The order may fill partially or remain open."}</p>
        {sell ? <p className="mt-1 text-secondary">The order may remain open or fill partially.</p> : null}
      </div>
      <Button size="large" variant={sell ? "danger" : "primary"} onClick={onConfirm} className="mt-[18px] w-full">Place mock {sell ? "sell " : ""}order</Button>
      <Button size="large" variant="secondary" onClick={onBack} className="mt-3 w-full">Back</Button>
    </Dialog>
  );
}

export function OrderSuccessDialog({ order, open, onPrimary, onSecondary }: { order: MockOrder | null; open: boolean; onPrimary: () => void; onSecondary: () => void }) {
  if (!order) return null;
  const sell = order.side === "sell";

  return (
    <Dialog open={open} onOpenChange={() => {}} dismissible={false} title={sell ? "Sell order submitted" : "Order submitted"} className="max-h-[calc(100dvh-32px)] p-6 text-center lg:h-[620px] lg:-translate-y-[58px] lg:p-9">
      <div className="mx-auto flex size-[72px] items-center justify-center rounded-full bg-profit-bg text-profit"><Check size={32} strokeWidth={3} /></div>
      <h2 className="mt-[18px] text-[28px] leading-10 font-bold lg:text-[32px]">{sell ? "Sell order submitted" : "Order submitted"}</h2>
      <p className="mx-auto mt-3 max-w-[440px] text-left text-secondary lg:text-center">{sell ? "Your mock sell order is open. The FPT position remains unchanged until a fill occurs." : "Your mock limit order has been accepted and added to Open Orders."}</p>
      <div className="mt-5 rounded-[14px] border border-border-default bg-surface p-[18px] text-left">
        <SummaryRow label="Order ID" value={order.id} />
        <SummaryRow label={sell ? "Order" : "FPT"} value={`${sell ? "SELL" : "BUY"} ${order.quantity.toLocaleString("en-US")} FPT @ ${formatVnd(order.limitPrice)}`} />
        <SummaryRow label="Status" value="OPEN" valueClass="text-profit" />
        <SummaryRow label="Submitted" value={order.submittedAt} />
      </div>
      <Button size="large" onClick={onPrimary} className="mt-[18px] w-full">{sell ? "View orders" : "View portfolio"}</Button>
      <Button size="large" variant="secondary" onClick={onSecondary} className="mt-3 w-full">{sell ? "Back to portfolio" : "Back to market"}</Button>
    </Dialog>
  );
}

function SummaryRow({ label, value, valueClass = "text-primary" }: { label: string; value: string; valueClass?: string }) {
  return <div className="flex min-h-[38px] items-center justify-between gap-4"><span className="type-body-s text-secondary">{label}</span><span className={`type-data-s text-right ${valueClass}`}>{value}</span></div>;
}
