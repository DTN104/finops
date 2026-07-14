"use client";

import { Button, Dialog } from "@/components/ui";
import { formatVnd, type MockOrder } from "@/lib/trading";

export function CancelOrderDialog({ order, open, onKeep, onCancel }: { order: MockOrder | null; open: boolean; onKeep: () => void; onCancel: () => void }) {
  if (!order) return null;
  const unfilled = order.quantity - order.filledQuantity;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onKeep(); }} title={`Cancel ${order.symbol} order`} className="max-h-[calc(100dvh-32px)] max-w-[520px] p-6 lg:h-[500px] lg:p-8">
      <p className="type-label-m text-loss">CANCEL OPEN ORDER</p>
      <h2 className="mt-[18px] text-[26px] leading-8 font-bold lg:text-[32px] lg:leading-10">Cancel {order.symbol} {order.side} order?</h2>
      <p className="mt-[18px] text-secondary">The unfilled quantity of {unfilled.toLocaleString("en-US")} shares will be cancelled. Filled quantities, if any, cannot be reversed.</p>
      <div className="mt-[18px] rounded-[12px] border border-border-default bg-surface p-4">
        <CancelSummaryRow label="Order ID" value={order.id} />
        <CancelSummaryRow label="Symbol" value={order.symbol} />
        <CancelSummaryRow label="Unfilled" value={`${unfilled.toLocaleString("en-US")} shares`} />
        <CancelSummaryRow label="Limit" value={formatVnd(order.limitPrice)} />
      </div>
      <Button size="large" variant="danger" onClick={onCancel} className="mt-[18px] w-full">Cancel mock order</Button>
      <Button size="large" variant="secondary" onClick={onKeep} className="mt-[18px] w-full">Keep order</Button>
    </Dialog>
  );
}

function CancelSummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex h-7 items-center justify-between gap-4"><span className="type-body-s text-secondary">{label}</span><span className="type-data-s text-right">{value}</span></div>;
}
