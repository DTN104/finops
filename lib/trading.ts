import { z } from "zod";

import type { DemoRole } from "@/lib/session";

export const orderSideSchema = z.enum(["buy", "sell"]);
export type OrderSide = z.infer<typeof orderSideSchema>;
export type OrderStatus = "PENDING" | "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED";
export type OrderType = "LIMIT" | "STOP";

export const orderDraftSchema = z.object({
  symbol: z.literal("FPT"),
  side: orderSideSchema,
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be greater than zero").refine((value) => value % 100 === 0, "Quantity must use 100-share lots"),
  limitPrice: z.number().int("Price must be a whole number").positive("Price must be greater than zero").refine((value) => value % 100 === 0, "Price must use ₫100 ticks"),
  orderType: z.literal("LIMIT").default("LIMIT"),
});

export type OrderDraft = z.infer<typeof orderDraftSchema>;

export interface OrderContext {
  role: DemoRole;
  buyingPower: number;
  positionQuantity: number;
  averageCost: number;
}

export interface OrderEstimate {
  gross: number;
  fee: number;
  total: number;
  proceeds: number;
  buyingPowerAfter: number;
  positionRemaining: number;
  realizedPnl: number;
}

export interface ValidationIssue {
  code: "permission" | "quantity" | "price" | "buying_power" | "position";
  message: string;
}

export interface MockOrder {
  symbol: string;
  side: OrderSide;
  quantity: number;
  limitPrice: number;
  orderType: OrderType;
  id: string;
  status: OrderStatus;
  filledQuantity: number;
  reservedBuyingPower: number;
  submittedDate: string;
  submittedAt: string;
  actor: string;
  estimate: OrderEstimate;
}

export function canPlaceOrders(role: DemoRole): boolean {
  return role === "trader" || role === "admin";
}

export function isOrderActive(order: Pick<MockOrder, "status">): boolean {
  return order.status === "PENDING" || order.status === "OPEN" || order.status === "PARTIAL";
}

export function canCancelOrder(order: Pick<MockOrder, "status" | "actor">, role: DemoRole, actor: string): boolean {
  if (!isOrderActive(order)) return false;
  return role === "admin" || (role === "trader" && order.actor === actor);
}

export function estimateOrder(draft: Pick<OrderDraft, "side" | "quantity" | "limitPrice">, context: Pick<OrderContext, "buyingPower" | "positionQuantity" | "averageCost">): OrderEstimate {
  const gross = draft.quantity * draft.limitPrice;
  const fee = Math.round(gross * 0.0015);
  const isBuy = draft.side === "buy";

  return {
    gross,
    fee,
    total: isBuy ? gross + fee : 0,
    proceeds: isBuy ? 0 : gross - fee,
    buyingPowerAfter: isBuy ? context.buyingPower - gross - fee : context.buyingPower,
    positionRemaining: isBuy ? context.positionQuantity : context.positionQuantity - draft.quantity,
    realizedPnl: isBuy ? 0 : (draft.limitPrice - context.averageCost) * draft.quantity,
  };
}

export function validateOrder(input: unknown, context: OrderContext): { success: true; draft: OrderDraft; estimate: OrderEstimate } | { success: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!canPlaceOrders(context.role)) {
    issues.push({ code: "permission", message: "Viewer role cannot place orders" });
  }

  const parsed = orderDraftSchema.safeParse(input);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      issues.push({
        code: field === "limitPrice" ? "price" : "quantity",
        message: issue.message,
      });
    }
    return { success: false, issues };
  }

  const estimate = estimateOrder(parsed.data, context);
  if (parsed.data.side === "buy" && estimate.total > context.buyingPower) {
    issues.push({ code: "buying_power", message: "Estimated total plus fees exceeds buying power" });
  }
  if (parsed.data.side === "sell" && parsed.data.quantity > context.positionQuantity) {
    issues.push({ code: "position", message: "Quantity exceeds the available FPT position" });
  }

  return issues.length ? { success: false, issues } : { success: true, draft: parsed.data, estimate };
}

export function formatVnd(value: number): string {
  return `₫${Math.round(value).toLocaleString("en-US")}`;
}
