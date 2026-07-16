"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, Profiler, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type ProfilerOnRenderCallback } from "react";

import { Button, MetricCard } from "@/components/ui";
import { formatMarketPrice, formatPercent } from "@/lib/market-data";
import {
  applyPerformanceTick,
  createPerformanceRows,
  PERFORMANCE_CADENCE_MS,
  PERFORMANCE_ROW_COUNT,
  PERFORMANCE_UPDATES_PER_TICK,
  type PerformanceRow,
} from "@/lib/performance-lab";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 38;
const INITIAL_ROW = 1_841;
const columns = "grid-cols-[70px_90px_120px_100px_110px_115px_minmax(100px,1fr)]";

interface Telemetry {
  fps: number;
  commitMs: number;
  visibleRows: number;
  renderCount: number;
  frameTimes: number[];
}

interface TableProps {
  rows: readonly PerformanceRow[];
  onRowRender: () => void;
  visibleRowsRef: React.MutableRefObject<number>;
}

function MarketRow({ row, index, onRender }: { row: PerformanceRow; index: number; onRender: () => void }) {
  onRender();
  const changed = row.updateCount > 0;

  return (
    <div role="row" className={cn("grid h-[38px] items-center border-t border-border-default px-3 type-data-s text-secondary", columns, changed && "bg-surface-subtle")}>
      <span role="cell">{index + 1}</span>
      <span role="cell" className="type-data-m text-primary">{row.symbol}</span>
      <span role="cell">{formatMarketPrice(row.last)}</span>
      <span role="cell" className={row.changePercent > 0 ? "text-profit" : row.changePercent < 0 ? "text-loss" : "text-secondary"}>
        <span className="sr-only">{row.changePercent > 0 ? "Gain" : row.changePercent < 0 ? "Loss" : "Unchanged"}: </span>
        {formatPercent(row.changePercent)}
      </span>
      <span role="cell">{row.volume.toLocaleString("en-US")}</span>
      <span role="cell">{row.renderMs.toFixed(2)}</span>
      <span role="cell" className={changed ? "text-info" : "text-muted"}>{changed ? "UPDATED" : "IDLE"}</span>
    </div>
  );
}

const MemoMarketRow = memo(MarketRow);

function TableHeader() {
  return (
    <div role="row" className={cn("grid h-10 shrink-0 items-center bg-surface-raised px-3 type-label-m text-secondary", columns)}>
      <span role="columnheader">#</span>
      <span role="columnheader">Symbol</span>
      <span role="columnheader">Last</span>
      <span role="columnheader">Change</span>
      <span role="columnheader">Volume</span>
      <span role="columnheader">Render ms</span>
      <span role="columnheader">Status</span>
    </div>
  );
}

function VirtualizedMarketTable({ rows, onRowRender, visibleRowsRef }: TableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // TanStack Virtual intentionally exposes mutable measurement functions.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => rows[index].symbol,
    initialOffset: INITIAL_ROW * ROW_HEIGHT,
    overscan: 4,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const first = virtualRows[0]?.index ?? 0;
  const last = virtualRows.at(-1)?.index ?? 0;

  useEffect(() => {
    visibleRowsRef.current = virtualRows.length;
  }, [virtualRows.length, visibleRowsRef]);

  return (
    <div role="table" aria-label="Virtualized realtime market benchmark" aria-rowcount={rows.length} className="flex h-[600px] min-w-[790px] flex-col overflow-hidden rounded-[14px] border border-border-default bg-surface">
      <TableHeader />
      <div ref={scrollRef} role="rowgroup" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--finops-border-focus)] [&::-webkit-scrollbar]:hidden">
        <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
          {virtualRows.map((virtualRow) => (
            <div key={virtualRow.key} className="absolute top-0 left-0 w-full" style={{ transform: `translateY(${virtualRow.start}px)` }}>
              <MemoMarketRow row={rows[virtualRow.index]} index={virtualRow.index} onRender={onRowRender} />
            </div>
          ))}
        </div>
      </div>
      <footer className="flex h-[38px] shrink-0 items-center justify-between border-t border-border-default px-3 type-data-s text-muted">
        <span>Window {first + 1}–{last + 1} of {rows.length.toLocaleString("en-US")}</span>
        <span>Virtualized • {virtualRows.length} mounted</span>
      </footer>
    </div>
  );
}

function BaselineMarketTable({ rows, onRowRender, visibleRowsRef }: TableProps) {
  useEffect(() => {
    visibleRowsRef.current = rows.length;
  }, [rows.length, visibleRowsRef]);

  return (
    <div role="table" aria-label="Baseline realtime market benchmark" aria-rowcount={rows.length} className="flex h-[600px] min-w-[790px] flex-col overflow-hidden rounded-[14px] border border-border-default bg-surface">
      <TableHeader />
      <div role="rowgroup" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--finops-border-focus)] [&::-webkit-scrollbar]:hidden">
        {rows.map((row, index) => <MarketRow key={row.symbol} row={row} index={index} onRender={onRowRender} />)}
      </div>
      <footer className="flex h-[38px] shrink-0 items-center justify-between border-t border-border-default px-3 type-data-s text-muted">
        <span>All {rows.length.toLocaleString("en-US")} rows mounted</span>
        <span>Baseline rendering</span>
      </footer>
    </div>
  );
}

function PipelineSwitch({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 type-body-s text-secondary">
      <span aria-hidden="true" className={cn("relative h-[22px] w-[38px] rounded-full", enabled ? "bg-brand" : "bg-[var(--finops-navy-800)]")}>
        <span className={cn("absolute top-1 size-[14px] rounded-full", enabled ? "right-1 bg-on-brand" : "left-1 bg-muted")} />
      </span>
      {label}
    </span>
  );
}

function FrameBudget({ optimized, frameTimes }: { optimized: boolean; frameTimes: number[] }) {
  const samples = frameTimes.length ? frameTimes : Array.from({ length: 16 }, (_, index) => optimized ? 3 + (index % 5) : 18 + (index % 7) * 2);

  return (
    <aside className="rounded-[14px] border border-border-default bg-surface p-4">
      <h2 className="type-heading-h3">Frame budget</h2>
      <p className="type-data-s mt-[14px] text-muted">16.7 ms / frame</p>
      <div aria-label="Recent React commit durations" className="mt-[14px] flex h-[170px] items-end gap-1.5 rounded-[10px] bg-canvas p-3">
        {samples.slice(-16).map((time, index) => (
          <span key={index} title={`${time.toFixed(1)} ms`} className={cn("min-w-0 flex-1 rounded-[3px]", optimized ? "bg-profit" : "bg-loss")} style={{ height: `${Math.min(100, Math.max(12, time * (optimized ? 6 : 2.4)))}%` }} />
        ))}
      </div>
      <p className={cn("type-body-s mt-[14px]", optimized ? "text-profit" : "text-loss")}>{optimized ? "Only changed visible rows commit." : "All mounted rows commit on every tick."}</p>
      <ul className="mt-[14px] space-y-2 type-body-s text-secondary">
        {["Windowed rendering", "Buffered socket updates", "Memoized row component", "Stable row identities", "Deferred search"].map((technique) => (
          <li key={technique} className="flex items-center gap-2"><span aria-hidden="true" className={cn("size-2 rounded-full", optimized ? "bg-profit" : "bg-loss")} />{technique}</li>
        ))}
      </ul>
    </aside>
  );
}

export function PerformanceLab() {
  const [optimized, setOptimized] = useState(true);
  const [rows, setRows] = useState(createPerformanceRows);
  const [search, setSearch] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const deferredSearch = useDeferredValue(search);
  const tickRef = useRef(0);
  const renderCountRef = useRef(0);
  const visibleRowsRef = useRef(0);
  const commitRef = useRef(0);
  const frameTimesRef = useRef<number[]>([]);
  const framesRef = useRef(0);
  const [telemetry, setTelemetry] = useState<Telemetry>({ fps: 0, commitMs: 0, visibleRows: 0, renderCount: 0, frameTimes: [] });

  const query = (optimized ? deferredSearch : search).trim().toLowerCase();
  const filteredRows = useMemo(() => query ? rows.filter((row) => row.symbol.toLowerCase().includes(query) || row.company.toLowerCase().includes(query)) : rows, [query, rows]);
  const onRowRender = useCallback(() => { renderCountRef.current += 1; }, []);
  const onProfilerRender = useCallback<ProfilerOnRenderCallback>((_id, _phase, actualDuration) => {
    commitRef.current = actualDuration;
    frameTimesRef.current = [...frameTimesRef.current.slice(-15), actualDuration];
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tickRef.current += 1;
      setRows((current) => applyPerformanceTick(current, tickRef.current));
    }, PERFORMANCE_CADENCE_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    const countFrame = () => {
      framesRef.current += 1;
      animationFrame = window.requestAnimationFrame(countFrame);
    };
    animationFrame = window.requestAnimationFrame(countFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    framesRef.current = 0;
    renderCountRef.current = 0;
    frameTimesRef.current = [];
    const interval = window.setInterval(() => {
      setTelemetry({
        fps: Math.min(60, framesRef.current * 2),
        commitMs: commitRef.current,
        visibleRows: visibleRowsRef.current,
        renderCount: renderCountRef.current,
        frameTimes: frameTimesRef.current,
      });
      framesRef.current = 0;
    }, 500);
    return () => window.clearInterval(interval);
  }, [resetKey]);

  const switchMode = (nextOptimized: boolean) => {
    setOptimized(nextOptimized);
    setResetKey((key) => key + 1);
  };

  return (
    <main className="p-4 lg:p-5">
      <header className="flex flex-col gap-4 lg:h-[86px] lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div>
          <p className={cn("type-label-m", optimized ? "text-profit" : "text-loss")}>{optimized ? "OPTIMIZED PIPELINE" : "BASELINE PIPELINE"}</p>
          <h1 className="mt-1 type-heading-h1">5,000-row realtime table</h1>
          <p className="type-body-s mt-1 text-secondary">Simulates 100 symbol updates every 50 ms while preserving scroll responsiveness.</p>
        </div>
        <div className="flex gap-[10px] lg:pt-[23px]">
          <Button size="medium" variant="secondary" className="w-[148px]" onClick={() => setResetKey((key) => key + 1)}>Reset metrics</Button>
          <Button size="medium" className="w-[148px]" onClick={() => switchMode(!optimized)}>{optimized ? "Compare baseline" : "Return optimized"}</Button>
        </div>
      </header>

      <section aria-label="Benchmark controls" className="mt-[14px] flex min-h-[66px] flex-wrap items-center gap-x-[14px] gap-y-3 rounded-[14px] border border-border-default bg-surface px-4 py-[14px]">
        <PipelineSwitch label="Virtualization" enabled={optimized} />
        <PipelineSwitch label="React.memo" enabled={optimized} />
        <PipelineSwitch label="Batch updates" enabled={optimized} />
        <PipelineSwitch label="Stable row keys" enabled={optimized} />
        <span className="flex items-center gap-2"><span className="type-body-s text-secondary">Update rate</span><span className="rounded-[10px] border border-border-default bg-canvas px-3 py-2 type-data-s">20 ticks/s</span></span>
        <label className="min-w-[210px] flex-1 lg:max-w-[260px]">
          <span className="sr-only">Filter market rows</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter 5,000 symbols" className="h-[38px] w-full rounded-[10px] border border-border-default bg-canvas px-3 text-primary outline-none placeholder:text-muted focus:border-border-focus focus:shadow-[var(--focus-accent)]" />
        </label>
      </section>

      <section aria-label="Live performance measurements" className="mt-[14px] grid grid-cols-2 gap-[10px] lg:grid-cols-5">
        <MetricCard label="Approx. FPS" value={telemetry.fps ? telemetry.fps.toFixed(1) : "—"} supporting={optimized ? "target 60" : "baseline load"} trend={optimized ? "positive" : "negative"} className="h-[102px] w-auto gap-1 p-[14px] [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard label="React commit" value={`${telemetry.commitMs.toFixed(1)} ms`} supporting="latest Profiler commit" trend={telemetry.commitMs <= 16.7 ? "positive" : "negative"} className="h-[102px] w-auto gap-1 p-[14px] [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard label="Visible rows" value={telemetry.visibleRows.toLocaleString("en-US")} supporting={`of ${filteredRows.length.toLocaleString("en-US")}`} className="h-[102px] w-auto gap-1 p-[14px] [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard label="Render count" value={telemetry.renderCount.toLocaleString("en-US")} supporting="since metrics reset" trend={optimized ? "positive" : "warning"} className="h-[102px] w-auto gap-1 p-[14px] [&_[data-slot=trend-bar]]:hidden" />
        <MetricCard label="Update cadence" value={`${PERFORMANCE_CADENCE_MS} ms`} supporting={`${PERFORMANCE_UPDATES_PER_TICK} updates / batch`} className="col-span-2 h-[102px] w-auto gap-1 p-[14px] lg:col-span-1 [&_[data-slot=trend-bar]]:hidden" />
      </section>

      <section className="mt-[14px] grid gap-3 min-[1400px]:grid-cols-[minmax(0,1fr)_minmax(300px,366px)]">
        <div className="overflow-x-auto">
          <Profiler id={optimized ? "optimized-market-table" : "baseline-market-table"} onRender={onProfilerRender}>
            {optimized
              ? <VirtualizedMarketTable rows={filteredRows} onRowRender={onRowRender} visibleRowsRef={visibleRowsRef} />
              : <BaselineMarketTable rows={filteredRows} onRowRender={onRowRender} visibleRowsRef={visibleRowsRef} />}
          </Profiler>
        </div>
        <FrameBudget optimized={optimized} frameTimes={telemetry.frameTimes} />
      </section>

      <p className="sr-only" aria-live="polite">{optimized ? "Optimized" : "Baseline"} benchmark active. {PERFORMANCE_ROW_COUNT.toLocaleString("en-US")} deterministic rows update in batches every {PERFORMANCE_CADENCE_MS} milliseconds.</p>
    </main>
  );
}
