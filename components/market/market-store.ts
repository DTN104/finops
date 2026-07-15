"use client";

import { create } from "zustand";

import { marketInstruments, type MarketInstrument } from "@/lib/market-data";

interface MarketState {
  instruments: MarketInstrument[];
  tick: number;
  applyNextBatch: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  instruments: [...marketInstruments],
  tick: 0,
  applyNextBatch: () => set((state) => {
    const tick = state.tick + 1;
    const updatedIndex = 1 + (tick % 9);
    const delta = [100, -50, 50, 0][tick % 4];
    return {
      tick,
      instruments: state.instruments.map((instrument, index) => {
        if (index !== updatedIndex) return instrument;
        const last = Math.max(100, instrument.last + delta);
        return {
          ...instrument,
          last,
          bid: last - 100,
          ask: last + 100,
          volume: instrument.volume + 100 * (tick % 17),
          changePercent: Number((((last - instrument.previousClose) / instrument.previousClose) * 100).toFixed(2)),
        };
      }),
    };
  }),
}));
