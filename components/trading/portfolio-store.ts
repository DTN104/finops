"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { appendAuditLog } from "@/components/operations/audit-store";
import { initialPositions, type PortfolioPosition } from "@/lib/portfolio";
import type { DemoRole } from "@/lib/session";
import { canCancelOrder, estimateOrder, isOrderActive, validateOrder, type MockOrder, type OrderDraft, type OrderSide, type OrderStatus, type OrderType } from "@/lib/trading";

export interface PortfolioState {
  buyingPower: number;
  cashBalance: number;
  realizedPnl: number;
  positions: Record<string, PortfolioPosition>;
  orders: MockOrder[];
  nextOrderNumber: number;
  submitOrder: (draft: OrderDraft, role: DemoRole, actor: string) => MockOrder;
  fillOrder: (orderId: string, quantity?: number) => boolean;
  cancelOrder: (orderId: string, role: DemoRole, actor: string) => boolean;
  reset: () => void;
}

interface SeedOrderInput {
  id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  orderType?: OrderType;
  status: OrderStatus;
  filledQuantity?: number;
  submittedDate: string;
  submittedAt: string;
}

function seedOrder(input: SeedOrderInput): MockOrder {
  const position = initialPositions[input.symbol] ?? { quantity: 0, averageCost: 0 };
  const estimate = estimateOrder(
    { side: input.side, quantity: input.quantity, limitPrice: input.price },
    { buyingPower: 486_200_000, positionQuantity: position.quantity, averageCost: position.averageCost },
  );

  return {
    id: input.id,
    symbol: input.symbol,
    side: input.side,
    quantity: input.quantity,
    limitPrice: input.price,
    orderType: input.orderType ?? "LIMIT",
    status: input.status,
    filledQuantity: input.filledQuantity ?? (input.status === "FILLED" ? input.quantity : 0),
    reservedBuyingPower: 0,
    submittedDate: input.submittedDate,
    submittedAt: input.submittedAt,
    actor: "Alex Morgan",
    estimate,
  };
}

export const seededOrders: MockOrder[] = [
  seedOrder({ id: "MOCK-20260714-1042", symbol: "FPT", side: "buy", quantity: 1_000, price: 126_400, status: "OPEN", submittedDate: "14 Jul 2026", submittedAt: "09:42:18" }),
  seedOrder({ id: "MOCK-20260714-1038", symbol: "HPG", side: "sell", quantity: 500, price: 31_500, status: "PARTIAL", filledQuantity: 200, submittedDate: "14 Jul 2026", submittedAt: "09:18:42" }),
  seedOrder({ id: "MOCK-20260713-0981", symbol: "VCB", side: "buy", quantity: 600, price: 58_600, status: "OPEN", submittedDate: "13 Jul 2026", submittedAt: "14:46:09" }),
  seedOrder({ id: "MOCK-20260712-0923", symbol: "SSI", side: "sell", quantity: 1_200, price: 37_400, status: "OPEN", submittedDate: "12 Jul 2026", submittedAt: "10:30:11" }),
  seedOrder({ id: "MOCK-20260711-0870", symbol: "MWG", side: "buy", quantity: 300, price: 66_200, orderType: "STOP", status: "PENDING", submittedDate: "11 Jul 2026", submittedAt: "15:02:31" }),
  seedOrder({ id: "MOCK-20260626-0724", symbol: "FPT", side: "buy", quantity: 800, price: 109_500, status: "FILLED", submittedDate: "26 Jun 2026", submittedAt: "10:14:22" }),
  seedOrder({ id: "MOCK-20260618-0691", symbol: "FPT", side: "buy", quantity: 600, price: 113_200, status: "FILLED", submittedDate: "18 Jun 2026", submittedAt: "11:22:07" }),
  seedOrder({ id: "MOCK-20260603-0614", symbol: "FPT", side: "buy", quantity: 1_000, price: 113_520, status: "FILLED", submittedDate: "03 Jun 2026", submittedAt: "09:37:44" }),
  seedOrder({ id: "MOCK-20260528-0588", symbol: "VNM", side: "buy", quantity: 200, price: 72_100, status: "CANCELLED", submittedDate: "28 May 2026", submittedAt: "13:04:18" }),
];

const initialPortfolioData = {
  buyingPower: 486_200_000,
  cashBalance: 486_200_000,
  realizedPnl: 24_514_000,
  positions: initialPositions,
  orders: seededOrders,
  nextOrderNumber: 1052,
};

const fallbackEntries = new Map<string, string>();
const fallbackStorage: StateStorage = {
  getItem: (name) => fallbackEntries.get(name) ?? null,
  setItem: (name, value) => { fallbackEntries.set(name, value); },
  removeItem: (name) => { fallbackEntries.delete(name); },
};

function updateOrder(orders: MockOrder[], id: string, updater: (order: MockOrder) => MockOrder): MockOrder[] {
  return orders.map((order) => order.id === id ? updater(order) : order);
}

function normalizeLegacyOrder(order: Partial<MockOrder> & Pick<MockOrder, "id" | "symbol" | "side" | "quantity" | "limitPrice" | "submittedAt" | "actor" | "estimate">): MockOrder {
  return {
    ...order,
    orderType: order.orderType ?? "LIMIT",
    status: order.status ?? "OPEN",
    filledQuantity: order.filledQuantity ?? 0,
    reservedBuyingPower: order.reservedBuyingPower ?? (order.side === "buy" && order.status === "OPEN" ? order.estimate.total : 0),
    submittedDate: order.submittedDate ?? "14 Jul 2026",
  } as MockOrder;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      ...initialPortfolioData,
      submitOrder: (draft, role, actor) => {
        const state = get();
        const position = state.positions[draft.symbol] ?? { quantity: 0, averageCost: 0 };
        const validation = validateOrder(draft, {
          role,
          buyingPower: state.buyingPower,
          positionQuantity: position.quantity,
          averageCost: position.averageCost,
        });
        if (!validation.success) {
          appendAuditLog({ actor, action: "ORDER_CREATE", module: "Trading", resource: draft.symbol, origin: "Paper trading", outcome: "DENIED", summary: validation.issues[0]?.message ?? "Order validation failed" });
          throw new Error(validation.issues[0]?.message ?? "Order validation failed");
        }

        const order: MockOrder = {
          ...validation.draft,
          id: `MOCK-20260714-${state.nextOrderNumber}`,
          status: "OPEN",
          filledQuantity: 0,
          reservedBuyingPower: validation.draft.side === "buy" ? validation.estimate.total : 0,
          submittedDate: "14 Jul 2026",
          submittedAt: validation.draft.side === "buy" ? "09:42:18" : "09:51:04",
          actor,
          estimate: validation.estimate,
        };

        set({
          buyingPower: validation.draft.side === "buy" ? validation.estimate.buyingPowerAfter : state.buyingPower,
          orders: [order, ...state.orders],
          nextOrderNumber: state.nextOrderNumber + 1,
        });
        appendAuditLog({ actor, action: "ORDER_CREATE", module: "Trading", resource: order.id, origin: "Paper trading", outcome: "SUCCESS", summary: `Created ${order.symbol} ${order.side} order` });
        return order;
      },
      fillOrder: (orderId, requestedQuantity) => {
        const state = get();
        const order = state.orders.find((candidate) => candidate.id === orderId);
        if (!order || !isOrderActive(order)) {
          appendAuditLog({ actor: "System Feed", action: "ORDER_FILL", module: "Trading", resource: orderId, origin: "Mock matching engine", outcome: "DENIED", summary: "Order is missing or inactive" });
          return false;
        }

        const unfilledQuantity = order.quantity - order.filledQuantity;
        const fillQuantity = requestedQuantity ?? unfilledQuantity;
        if (!Number.isInteger(fillQuantity) || fillQuantity <= 0 || fillQuantity > unfilledQuantity) {
          appendAuditLog({ actor: "System Feed", action: "ORDER_FILL", module: "Trading", resource: orderId, origin: "Mock matching engine", outcome: "DENIED", summary: "Invalid fill quantity" });
          return false;
        }

        const position = state.positions[order.symbol] ?? {
          symbol: order.symbol,
          company: order.symbol,
          sector: "Technology" as const,
          quantity: 0,
          averageCost: 0,
          last: order.limitPrice,
          previousClose: order.limitPrice,
        };
        if (order.side === "sell" && fillQuantity > position.quantity) {
          appendAuditLog({ actor: "System Feed", action: "ORDER_FILL", module: "Trading", resource: orderId, origin: "Mock matching engine", outcome: "DENIED", summary: "Fill exceeds available position" });
          return false;
        }

        const fee = Math.round(order.estimate.fee * (fillQuantity / order.quantity));
        const gross = fillQuantity * order.limitPrice;
        const filledQuantity = order.filledQuantity + fillQuantity;
        const status: OrderStatus = filledQuantity === order.quantity ? "FILLED" : "PARTIAL";
        let buyingPower = state.buyingPower;
        let cashBalance = state.cashBalance;
        let realizedPnl = state.realizedPnl;
        let nextPosition: PortfolioPosition;
        let reservedBuyingPower = order.reservedBuyingPower;

        if (order.side === "buy") {
          const nextQuantity = position.quantity + fillQuantity;
          const fillTotal = gross + fee;
          const coveredByReservation = Math.min(reservedBuyingPower, fillTotal);
          nextPosition = {
            ...position,
            quantity: nextQuantity,
            averageCost: nextQuantity ? ((position.quantity * position.averageCost) + gross) / nextQuantity : 0,
          };
          cashBalance -= fillTotal;
          buyingPower -= fillTotal - coveredByReservation;
          reservedBuyingPower = Math.max(0, reservedBuyingPower - coveredByReservation);
        } else {
          nextPosition = { ...position, quantity: position.quantity - fillQuantity };
          const proceeds = gross - fee;
          cashBalance += proceeds;
          buyingPower += proceeds;
          realizedPnl += (order.limitPrice - position.averageCost) * fillQuantity;
        }

        set({
          buyingPower,
          cashBalance,
          realizedPnl,
          positions: { ...state.positions, [order.symbol]: nextPosition },
          orders: updateOrder(state.orders, orderId, (candidate) => ({ ...candidate, status, filledQuantity, reservedBuyingPower })),
        });
        appendAuditLog({ actor: "System Feed", action: "ORDER_FILL", module: "Trading", resource: orderId, origin: "Mock matching engine", outcome: "SUCCESS", summary: `Filled ${fillQuantity} ${order.symbol} shares` });
        return true;
      },
      cancelOrder: (orderId, role, actor) => {
        const state = get();
        const order = state.orders.find((candidate) => candidate.id === orderId);
        if (!order || !canCancelOrder(order, role, actor)) {
          appendAuditLog({ actor, action: "ORDER_CANCEL", module: "Trading", resource: orderId, origin: "Paper trading", outcome: "DENIED", summary: "Order cannot be cancelled by this identity" });
          return false;
        }

        set({
          buyingPower: state.buyingPower + (order.side === "buy" ? order.reservedBuyingPower : 0),
          orders: updateOrder(state.orders, orderId, (candidate) => ({ ...candidate, status: "CANCELLED", reservedBuyingPower: 0 })),
        });
        appendAuditLog({ actor, action: "ORDER_CANCEL", module: "Trading", resource: orderId, origin: "Paper trading", outcome: "SUCCESS", summary: `Cancelled ${order.symbol} ${order.side} order` });
        return true;
      },
      reset: () => set(initialPortfolioData),
    }),
    {
      name: "finops-demo-portfolio",
      version: 2,
      storage: createJSONStorage(() => typeof window === "undefined" ? fallbackStorage : window.localStorage),
      migrate: (persistedState, version) => {
        if (version >= 2) return persistedState as PortfolioState;
        const legacy = persistedState as Partial<PortfolioState>;
        const legacyOrders = (legacy.orders ?? []).map((order) => normalizeLegacyOrder(order));
        const ids = new Set(legacyOrders.map((order) => order.id));
        return {
          ...initialPortfolioData,
          ...legacy,
          cashBalance: initialPortfolioData.cashBalance,
          realizedPnl: initialPortfolioData.realizedPnl,
          positions: { ...initialPositions, ...legacy.positions },
          orders: [...legacyOrders, ...seededOrders.filter((order) => !ids.has(order.id))],
          nextOrderNumber: Math.max(1052, legacy.nextOrderNumber ?? 1052),
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PortfolioState>;
        return {
          ...currentState,
          ...persisted,
          positions: { ...currentState.positions, ...persisted.positions },
          orders: persisted.orders ?? currentState.orders,
        };
      },
    },
  ),
);
