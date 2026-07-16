"use server";

import { revalidatePath } from "next/cache";

import type { OrderDraft } from "@/lib/trading";
import { getDemoSession } from "@/lib/session";
import { findActiveAccountByUser } from "@/server/repositories/account.repository";
import { db } from "@/server/db";
import { getPortfolioSnapshot } from "@/server/services/query.service";
import { cancelOrder, fillOrder, placeOrder } from "@/server/services/trading.service";

export async function placeOrderAction(draft: OrderDraft) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const account = await findActiveAccountByUser(db, user.id);
  if (!account) return { success: false, error: "Trading account is unavailable" } as const;
  const result = await placeOrder(user.id, {
    accountId: account.id,
    symbol: draft.symbol,
    side: draft.side,
    quantity: draft.quantity,
    limitPrice: draft.limitPrice,
    orderType: draft.orderType.toLowerCase() as "limit" | "stop",
  });
  if (!result.success) return result;
  revalidatePath("/orders");
  revalidatePath("/portfolio");
  const snapshot = await getPortfolioSnapshot(user.id, user.name);
  const order = snapshot?.orders.find((candidate) => candidate.id === result.data.publicId);
  return order ? { success: true, order } as const : { success: false, error: "Order was saved but could not be reloaded" } as const;
}

export async function cancelOrderAction(orderReference: string) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await cancelOrder(user.id, { orderReference });
  if (result.success) {
    revalidatePath("/orders");
    revalidatePath("/portfolio");
  }
  return result.success ? { success: true } as const : result;
}

export async function fillOrderAction(orderReference: string, quantity?: number) {
  const user = await getDemoSession();
  if (!user) return { success: false, error: "Session expired" } as const;
  const result = await fillOrder(user.id, { orderReference, quantity }, "server-action");
  if (result.success) {
    revalidatePath("/orders");
    revalidatePath("/portfolio");
  }
  return result.success ? { success: true } as const : result;
}
