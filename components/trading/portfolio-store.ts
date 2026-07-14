"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DemoRole } from "@/lib/session";
import { canPlaceOrders, estimateOrder, type MockOrder, type OrderDraft } from "@/lib/trading";

interface PositionState {
  quantity: number;
  averageCost: number;
}

interface PortfolioState {
  buyingPower: number;
  positions: Record<string, PositionState>;
  orders: MockOrder[];
  nextOrderNumber: number;
  submitOrder: (draft: OrderDraft, role: DemoRole, actor: string) => MockOrder;
  reset: () => void;
}

const initialPortfolio = {
  buyingPower: 486200000,
  positions: { FPT: { quantity: 2400, averageCost: 112100 } },
  orders: [] as MockOrder[],
  nextOrderNumber: 1042,
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      ...initialPortfolio,
      submitOrder: (draft, role, actor) => {
        if (!canPlaceOrders(role)) {
          throw new Error("Viewer role cannot place orders");
        }
        const state = get();
        const position = state.positions[draft.symbol] ?? { quantity: 0, averageCost: 0 };
        const estimate = estimateOrder(draft, {
          buyingPower: state.buyingPower,
          positionQuantity: position.quantity,
          averageCost: position.averageCost,
        });
        const order: MockOrder = {
          ...draft,
          id: `MOCK-20260714-${state.nextOrderNumber}`,
          status: "OPEN",
          submittedAt: draft.side === "buy" ? "09:42:18" : "09:51:04",
          actor,
          estimate,
        };

        set({
          buyingPower: draft.side === "buy" ? estimate.buyingPowerAfter : state.buyingPower,
          orders: [...state.orders, order],
          nextOrderNumber: state.nextOrderNumber + 1,
        });
        return order;
      },
      reset: () => set(initialPortfolio),
    }),
    { name: "finops-demo-portfolio", version: 1 },
  ),
);
