import { marketInstruments } from "@/lib/market-data";

export interface PerformanceRow {
  symbol: string;
  company: string;
  baseLast: number;
  last: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  renderMs: number;
  updateCount: number;
}

export const PERFORMANCE_ROW_COUNT = 5_000;
export const PERFORMANCE_UPDATES_PER_TICK = 100;
export const PERFORMANCE_CADENCE_MS = 50;

export function createPerformanceRows(): PerformanceRow[] {
  return marketInstruments.map((instrument, index) => ({
    symbol: instrument.symbol,
    company: instrument.company,
    baseLast: instrument.last,
    last: instrument.last,
    previousClose: instrument.previousClose,
    changePercent: instrument.changePercent,
    volume: instrument.volume,
    renderMs: Number((0.18 + (index % 18) * 0.03).toFixed(2)),
    updateCount: 0,
  }));
}

export function applyPerformanceTick(rows: readonly PerformanceRow[], tick: number): PerformanceRow[] {
  const next = rows.slice();

  for (let offset = 0; offset < PERFORMANCE_UPDATES_PER_TICK; offset += 1) {
    const index = (tick * 97 + offset * 47) % rows.length;
    const row = rows[index];
    const last = row.baseLast + (((tick + offset) % 5) - 2) * 50;
    next[index] = {
      ...row,
      last,
      changePercent: Number((((last - row.previousClose) / row.previousClose) * 100).toFixed(2)),
      volume: row.volume + 100 * (1 + ((tick + offset) % 17)),
      updateCount: row.updateCount + 1,
    };
  }

  return next;
}
