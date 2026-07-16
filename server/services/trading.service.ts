import { randomUUID } from "node:crypto";

import { z } from "zod";

import { estimateOrder } from "@/lib/trading";
import { db } from "@/server/db";
import { findAccountById, updateAccountBalances } from "@/server/repositories/account.repository";
import { findInstrument } from "@/server/repositories/instrument.repository";
import { findUserById } from "@/server/repositories/identity.repository";
import { createCashLedgerEntry, findPosition, upsertPosition } from "@/server/repositories/portfolio.repository";
import { createExecution, createOrder, findOrder, getReservedSellQuantity, updateOrder } from "@/server/repositories/trading.repository";
import { auditMutation, type MutationResult } from "@/server/services/mutation";

const uuidSchema = z.string().uuid();
const symbolSchema = z.string().trim().regex(/^[A-Z0-9]{1,20}$/).transform((value) => value.toUpperCase());

export const placeOrderInputSchema = z.object({
  accountId: uuidSchema,
  symbol: symbolSchema,
  side: z.enum(["buy", "sell"]),
  quantity: z.number().int().positive().refine((value) => value % 100 === 0, "Quantity must use 100-share lots"),
  limitPrice: z.number().int().positive().refine((value) => value % 100 === 0, "Price must use ₫100 ticks"),
  orderType: z.enum(["limit", "stop"]).default("limit"),
});

export const fillOrderInputSchema = z.object({
  orderReference: z.string().trim().min(1),
  quantity: z.number().int().positive().optional(),
});

export const cancelOrderInputSchema = z.object({ orderReference: z.string().trim().min(1) });

export type PlaceOrderInput = z.input<typeof placeOrderInputSchema>;
export type FillOrderInput = z.input<typeof fillOrderInputSchema>;

const activeStatuses = new Set(["pending", "open", "partial"]);

async function deny(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  input: { actorUserId?: string | null; accountId?: string | null; action: string; resourceId: string; origin: string; error: string },
): Promise<MutationResult<never>> {
  await auditMutation(tx, {
    actorUserId: input.actorUserId,
    accountId: input.accountId,
    action: input.action,
    module: "Trading",
    resourceType: "order",
    resourceId: input.resourceId,
    origin: input.origin,
    outcome: "denied",
    summary: input.error,
  });
  return { success: false, error: input.error };
}

export async function placeOrder(
  actorUserId: string,
  input: PlaceOrderInput,
  origin = "server-action",
) {
  return db.transaction(async (tx): Promise<MutationResult<Awaited<ReturnType<typeof createOrder>>>> => {
    const actorId = uuidSchema.safeParse(actorUserId).data ?? null;
    const parsed = placeOrderInputSchema.safeParse(input);
    if (!parsed.success) {
      return deny(tx, { actorUserId: actorId, action: "ORDER_CREATE", resourceId: "order-draft", origin, error: parsed.error.issues[0]?.message ?? "Invalid order" });
    }

    const actor = actorId ? await findUserById(tx, actorId) : null;
    const account = await findAccountById(tx, parsed.data.accountId, true);
    if (!actor || actor.status !== "active") {
      return deny(tx, { actorUserId: actorId, accountId: account?.id, action: "ORDER_CREATE", resourceId: parsed.data.symbol, origin, error: "Active user not found" });
    }
    if (!account || account.status !== "active" || account.userId !== actor.id) {
      return deny(tx, { actorUserId: actor.id, accountId: account?.id, action: "ORDER_CREATE", resourceId: parsed.data.symbol, origin, error: "Trading account is unavailable" });
    }
    if (actor.roleCode !== "trader" && actor.roleCode !== "admin") {
      return deny(tx, { actorUserId: actor.id, accountId: account.id, action: "ORDER_CREATE", resourceId: parsed.data.symbol, origin, error: "Viewer role cannot place orders" });
    }

    const instrument = await findInstrument(tx, parsed.data.symbol);
    if (!instrument || instrument.status !== "trading") {
      return deny(tx, { actorUserId: actor.id, accountId: account.id, action: "ORDER_CREATE", resourceId: parsed.data.symbol, origin, error: "Instrument is not available for trading" });
    }

    const position = await findPosition(tx, account.id, instrument.symbol, parsed.data.side === "sell");
    const estimate = estimateOrder(
      { side: parsed.data.side, quantity: parsed.data.quantity, limitPrice: parsed.data.limitPrice },
      { buyingPower: account.buyingPower, positionQuantity: position?.quantity ?? 0, averageCost: position?.averageCost ?? 0 },
    );
    if (parsed.data.side === "buy" && estimate.total > account.buyingPower) {
      return deny(tx, { actorUserId: actor.id, accountId: account.id, action: "ORDER_CREATE", resourceId: instrument.symbol, origin, error: "Estimated total plus fees exceeds buying power" });
    }
    if (parsed.data.side === "sell") {
      const reserved = await getReservedSellQuantity(tx, account.id, instrument.symbol);
      if (parsed.data.quantity > (position?.quantity ?? 0) - reserved) {
        return deny(tx, { actorUserId: actor.id, accountId: account.id, action: "ORDER_CREATE", resourceId: instrument.symbol, origin, error: `Quantity exceeds the available ${instrument.symbol} position` });
      }
    }

    const id = randomUUID();
    const publicId = `FIN-${id.slice(0, 8).toUpperCase()}`;
    const reservedAmount = parsed.data.side === "buy" ? estimate.total : 0;
    const order = await createOrder(tx, {
      id,
      publicId,
      accountId: account.id,
      instrumentSymbol: instrument.symbol,
      createdByUserId: actor.id,
      side: parsed.data.side,
      orderType: parsed.data.orderType,
      status: "open",
      quantity: parsed.data.quantity,
      limitPrice: parsed.data.limitPrice,
      reservedAmount,
    });

    if (reservedAmount > 0) {
      await updateAccountBalances(tx, account.id, { buyingPower: account.buyingPower - reservedAmount });
      await createCashLedgerEntry(tx, {
        accountId: account.id,
        orderId: order.id,
        type: "order_reserve",
        amount: -reservedAmount,
        balanceAfter: account.cashBalance,
        description: `Reserved buying power for ${publicId}`,
      });
    }
    await auditMutation(tx, {
      actorUserId: actor.id,
      accountId: account.id,
      action: "ORDER_CREATE",
      module: "Trading",
      resourceType: "order",
      resourceId: publicId,
      origin,
      outcome: "success",
      summary: `Created ${instrument.symbol} ${parsed.data.side} order`,
      after: order,
    });
    return { success: true, data: order };
  });
}

export async function fillOrder(actorUserId: string | null, input: FillOrderInput, origin = "matching-engine") {
  return db.transaction(async (tx): Promise<MutationResult<Awaited<ReturnType<typeof createExecution>>>> => {
    const actorId = actorUserId ? uuidSchema.safeParse(actorUserId).data ?? null : null;
    const parsed = fillOrderInputSchema.safeParse(input);
    if (!parsed.success) {
      return deny(tx, { actorUserId: actorId, action: "ORDER_FILL", resourceId: "invalid-order", origin, error: parsed.error.issues[0]?.message ?? "Invalid fill" });
    }
    const order = await findOrder(tx, parsed.data.orderReference, true);
    if (!order || !activeStatuses.has(order.status)) {
      return deny(tx, { actorUserId: actorId, accountId: order?.accountId, action: "ORDER_FILL", resourceId: parsed.data.orderReference, origin, error: "Order is missing or inactive" });
    }
    const account = await findAccountById(tx, order.accountId, true);
    if (!account) {
      return deny(tx, { actorUserId: actorId, action: "ORDER_FILL", resourceId: order.publicId, origin, error: "Trading account is unavailable" });
    }

    const unfilledQuantity = order.quantity - order.filledQuantity;
    const fillQuantity = parsed.data.quantity ?? unfilledQuantity;
    if (fillQuantity > unfilledQuantity) {
      return deny(tx, { actorUserId: actorId, accountId: account.id, action: "ORDER_FILL", resourceId: order.publicId, origin, error: "Fill quantity exceeds the open quantity" });
    }
    const position = await findPosition(tx, account.id, order.instrumentSymbol, true);
    if (order.side === "sell" && fillQuantity > (position?.quantity ?? 0)) {
      return deny(tx, { actorUserId: actorId, accountId: account.id, action: "ORDER_FILL", resourceId: order.publicId, origin, error: "Fill exceeds available position" });
    }

    const gross = fillQuantity * order.limitPrice;
    const fee = Math.round(gross * 0.0015);
    const nextFilledQuantity = order.filledQuantity + fillQuantity;
    const finalFill = nextFilledQuantity === order.quantity;
    const status = finalFill ? "filled" : "partial";
    let cashBalance = account.cashBalance;
    let buyingPower = account.buyingPower;
    let accountRealizedPnl = account.realizedPnl;
    let nextReservedAmount = order.reservedAmount;
    let positionQuantity = position?.quantity ?? 0;
    let averageCost = position?.averageCost ?? 0;
    let positionRealizedPnl = position?.realizedPnl ?? 0;

    if (order.side === "buy") {
      const total = gross + fee;
      if (total > cashBalance) {
        return deny(tx, { actorUserId: actorId, accountId: account.id, action: "ORDER_FILL", resourceId: order.publicId, origin, error: "Fill exceeds cash balance" });
      }
      const covered = Math.min(nextReservedAmount, total);
      const uncovered = total - covered;
      nextReservedAmount -= covered;
      cashBalance -= total;
      buyingPower -= uncovered;
      if (finalFill && nextReservedAmount > 0) buyingPower += nextReservedAmount;
      const nextQuantity = positionQuantity + fillQuantity;
      averageCost = nextQuantity ? ((positionQuantity * averageCost) + gross) / nextQuantity : 0;
      positionQuantity = nextQuantity;
    } else {
      const proceeds = gross - fee;
      const realized = (order.limitPrice - averageCost) * fillQuantity;
      positionQuantity -= fillQuantity;
      positionRealizedPnl += realized;
      accountRealizedPnl += realized;
      cashBalance += proceeds;
      buyingPower += proceeds;
    }

    const execution = await createExecution(tx, {
      orderId: order.id,
      accountId: account.id,
      instrumentSymbol: order.instrumentSymbol,
      quantity: fillQuantity,
      price: order.limitPrice,
      fee,
    });
    await upsertPosition(tx, {
      accountId: account.id,
      instrumentSymbol: order.instrumentSymbol,
      quantity: positionQuantity,
      averageCost: Math.round(averageCost),
      realizedPnl: positionRealizedPnl,
    });
    await updateAccountBalances(tx, account.id, { cashBalance, buyingPower, realizedPnl: accountRealizedPnl });
    await updateOrder(tx, order.id, {
      status,
      filledQuantity: nextFilledQuantity,
      reservedAmount: finalFill ? 0 : nextReservedAmount,
    });
    await createCashLedgerEntry(tx, {
      accountId: account.id,
      orderId: order.id,
      executionId: execution.id,
      type: order.side === "buy" ? "trade_debit" : "trade_credit",
      amount: order.side === "buy" ? -(gross + fee) : gross - fee,
      balanceAfter: cashBalance,
      description: `Filled ${fillQuantity} ${order.instrumentSymbol} for ${order.publicId}`,
    });
    await auditMutation(tx, {
      actorUserId: actorId,
      accountId: account.id,
      action: "ORDER_FILL",
      module: "Trading",
      resourceType: "order",
      resourceId: order.publicId,
      origin,
      outcome: "success",
      summary: `Filled ${fillQuantity} ${order.instrumentSymbol} shares`,
      before: order,
      after: { status, filledQuantity: nextFilledQuantity, executionId: execution.id },
    });
    return { success: true, data: execution };
  });
}

export async function cancelOrder(actorUserId: string, input: z.input<typeof cancelOrderInputSchema>, origin = "server-action") {
  return db.transaction(async (tx): Promise<MutationResult<NonNullable<Awaited<ReturnType<typeof updateOrder>>>>> => {
    const actorId = uuidSchema.safeParse(actorUserId).data ?? null;
    const parsed = cancelOrderInputSchema.safeParse(input);
    if (!parsed.success) {
      return deny(tx, { actorUserId: actorId, action: "ORDER_CANCEL", resourceId: "invalid-order", origin, error: "Invalid order reference" });
    }
    const actor = actorId ? await findUserById(tx, actorId) : null;
    const order = await findOrder(tx, parsed.data.orderReference, true);
    if (!actor || actor.status !== "active" || !order || !activeStatuses.has(order.status)) {
      return deny(tx, { actorUserId: actorId, accountId: order?.accountId, action: "ORDER_CANCEL", resourceId: parsed.data.orderReference, origin, error: "Order cannot be cancelled" });
    }
    const permitted = actor.roleCode === "admin" || (actor.roleCode === "trader" && order.createdByUserId === actor.id);
    if (!permitted) {
      return deny(tx, { actorUserId: actor.id, accountId: order.accountId, action: "ORDER_CANCEL", resourceId: order.publicId, origin, error: "Order cannot be cancelled by this identity" });
    }
    const account = await findAccountById(tx, order.accountId, true);
    if (!account) {
      return deny(tx, { actorUserId: actor.id, action: "ORDER_CANCEL", resourceId: order.publicId, origin, error: "Trading account is unavailable" });
    }
    if (order.reservedAmount > 0) {
      await updateAccountBalances(tx, account.id, { buyingPower: account.buyingPower + order.reservedAmount });
      await createCashLedgerEntry(tx, {
        accountId: account.id,
        orderId: order.id,
        type: "order_release",
        amount: order.reservedAmount,
        balanceAfter: account.cashBalance,
        description: `Released buying power for ${order.publicId}`,
      });
    }
    const cancelled = await updateOrder(tx, order.id, { status: "cancelled", reservedAmount: 0, cancelledAt: new Date() });
    if (!cancelled) throw new Error("Order disappeared during cancellation");
    await auditMutation(tx, {
      actorUserId: actor.id,
      accountId: account.id,
      action: "ORDER_CANCEL",
      module: "Trading",
      resourceType: "order",
      resourceId: order.publicId,
      origin,
      outcome: "success",
      summary: `Cancelled ${order.instrumentSymbol} ${order.side} order`,
      before: order,
      after: cancelled,
    });
    return { success: true, data: cancelled };
  });
}
