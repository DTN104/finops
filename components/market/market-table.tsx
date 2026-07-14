"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Pagination, StatusBadge } from "@/components/ui";
import { formatMarketPrice, formatPercent, marketInstruments, type MarketInstrument } from "@/lib/market-data";
import { cn } from "@/lib/utils";

const columnClasses: Record<string, string> = {
  symbol: "w-[8%]",
  company: "w-[22%]",
  last: "w-[9%]",
  changePercent: "w-[10%]",
  volume: "w-[13%]",
  bid: "w-[10%]",
  ask: "w-[10%]",
  status: "w-[10%]",
};

function useRealtimeMarket(): MarketInstrument[] {
  const [instruments, setInstruments] = useState<MarketInstrument[]>(() => [...marketInstruments]);
  const tick = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick.current += 1;
      const updatedIndex = 1 + (tick.current % 9);
      const delta = [100, -50, 50, 0][tick.current % 4];
      setInstruments((current) => current.map((instrument, index) => {
        if (index !== updatedIndex) return instrument;
        const last = Math.max(100, instrument.last + delta);
        return {
          ...instrument,
          last,
          bid: last - 100,
          ask: last + 100,
          volume: instrument.volume + 100 * (tick.current % 17),
          changePercent: Number((((last - instrument.previousClose) / instrument.previousClose) * 100).toFixed(2)),
        };
      }));
    }, 500);
    return () => window.clearInterval(interval);
  }, []);

  return instruments;
}

export function MarketTable() {
  const router = useRouter();
  const instruments = useRealtimeMarket();
  const [globalFilter, setGlobalFilter] = useState("");
  const [sector, setSector] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredBySector = useMemo(
    () => sector === "all" ? instruments : instruments.filter((instrument) => instrument.sector === sector),
    [instruments, sector],
  );

  const columns = useMemo<ColumnDef<MarketInstrument>[]>(() => [
    { accessorKey: "symbol", header: "Symbol", cell: ({ row }) => <span className="type-data-m text-primary">{row.original.symbol}</span> },
    { accessorKey: "company", header: "Company" },
    { accessorKey: "last", header: "Last", cell: ({ getValue }) => formatMarketPrice(getValue<number>()) },
    { accessorKey: "changePercent", header: "Change", cell: ({ getValue }) => { const value = getValue<number>(); return <span className={value > 0 ? "text-profit" : value < 0 ? "text-loss" : "text-secondary"}><span className="sr-only">{value > 0 ? "Gain" : value < 0 ? "Loss" : "Unchanged"}: </span>{formatPercent(value)}</span>; } },
    { accessorKey: "volume", header: "Volume", cell: ({ getValue }) => getValue<number>().toLocaleString("en-US") },
    { accessorKey: "bid", header: "Bid", cell: ({ getValue }) => formatMarketPrice(getValue<number>()) },
    { accessorKey: "ask", header: "Ask", cell: ({ getValue }) => formatMarketPrice(getValue<number>()) },
    { accessorKey: "status", header: "Status", enableSorting: false, cell: () => <StatusBadge label="TRADING" tone="success" className="h-7 w-[110px] justify-center border-0 py-0" /> },
  ], []);

  // TanStack Table intentionally exposes a mutable table API behind this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredBySector,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value).trim().toLowerCase();
      return row.original.symbol.toLowerCase().includes(query) || row.original.company.toLowerCase().includes(query);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const pageRows = table.getRowModel().rows;
  const page = table.getState().pagination.pageIndex;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      <div className="flex w-full flex-col gap-[14px] lg:gap-[18px]">
        <div className="flex flex-col gap-[14px] lg:flex-row lg:items-center lg:gap-[10px]">
          <label className="sr-only" htmlFor="market-search">Search market</label>
          <input id="market-search" value={globalFilter} onChange={(event) => { setGlobalFilter(event.target.value); table.setPageIndex(0); }} placeholder="Search symbol or company" className="h-11 w-full rounded-[10px] border border-border-default bg-surface px-[13px] text-primary outline-none placeholder:text-muted focus:border-border-focus focus:shadow-[var(--focus-accent)] lg:h-[42px] lg:w-[360px] lg:px-[14px]" />
          <div className="flex items-center gap-2 lg:gap-[10px]">
            <span className="rounded-full border border-border-default bg-surface px-[10px] py-[7px] type-label-m text-secondary lg:flex lg:h-10 lg:w-[148px] lg:items-center lg:justify-center lg:rounded-[var(--radius-sm)] lg:bg-surface-raised">HOSE</span>
            <button type="button" onClick={() => { setSorting([{ id: "volume", desc: true }]); table.setPageIndex(0); }} className="rounded-full border border-border-default bg-surface px-[10px] py-[7px] type-label-m text-secondary lg:order-3 lg:flex lg:h-10 lg:w-[148px] lg:items-center lg:justify-center lg:rounded-[var(--radius-sm)] lg:bg-surface-raised">Top volume</button>
            <label className="relative lg:order-2">
              <span className="sr-only">Sector</span>
              <select value={sector} onChange={(event) => { setSector(event.target.value); table.setPageIndex(0); }} className="appearance-none rounded-full border border-border-default bg-surface px-[10px] py-[7px] pr-7 type-label-m text-secondary outline-none lg:h-10 lg:w-[148px] lg:rounded-[var(--radius-sm)] lg:bg-surface-raised lg:px-4">
                <option value="all">All sectors</option>
                <option value="Technology">Technology</option>
                <option value="Banking">Banking</option>
                <option value="Consumer">Consumer</option>
              </select>
            </label>
            <span className="type-data-s hidden rounded-full bg-surface px-[10px] py-[7px] text-muted lg:order-4 lg:block">{Math.min(10, filteredCount)} / {filteredCount}</span>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[14px] border border-border-default bg-surface lg:block">
          <table className="w-full table-fixed border-collapse type-data-s">
            <thead className="bg-surface-raised text-secondary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} scope="col" className={cn("h-[46px] px-[14px] text-left type-label-m", columnClasses[header.column.id])}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 text-left">
                          {flexRender(header.column.columnDef.header, header.getContext())}<ArrowUpDown aria-hidden="true" size={12} />
                        </button>
                      ) : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const fpt = row.original.symbol === "FPT";
                return (
                  <tr key={row.id} tabIndex={fpt ? 0 : undefined} role={fpt ? "link" : undefined} onClick={fpt ? () => router.push("/market/FPT") : undefined} onKeyDown={fpt ? (event) => { if (event.key === "Enter" || event.key === " ") router.push("/market/FPT"); } : undefined} className={cn("h-[54px] border-t border-border-default", fpt && "cursor-pointer bg-surface-subtle focus:outline-none focus:shadow-[inset_0_0_0_2px_var(--finops-border-focus)]")}>
                    {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-[14px] text-secondary">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex h-14 items-center justify-between px-[14px]">
            <p className="type-body-s text-secondary">Showing {filteredCount ? page * 10 + 1 : 0}–{Math.min((page + 1) * 10, filteredCount)} of {filteredCount.toLocaleString("en-US")} mock instruments</p>
            <Pagination page={page} pageCount={Math.max(1, table.getPageCount())} onPageChange={table.setPageIndex} />
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-border-default bg-surface lg:hidden">
          {pageRows.slice(0, 7).map((row) => {
            const instrument = row.original;
            const content = (
              <>
                <span className="flex flex-col gap-[3px]"><span className="type-data-m text-primary">{instrument.symbol}</span><span className="type-body-s text-muted">{instrument.company.replace(" Group", "")}</span></span>
                <span className="flex flex-col items-end gap-[3px]"><span className="type-data-m text-primary">{formatMarketPrice(instrument.last)}</span><span className="type-data-s text-muted">{(instrument.volume / 1000000).toFixed(2)}M</span></span>
                <span className={cn("type-data-s text-right", instrument.changePercent > 0 ? "text-profit" : instrument.changePercent < 0 ? "text-loss" : "text-secondary")}><span className="sr-only">{instrument.changePercent > 0 ? "Gain" : "Loss"}: </span>{formatPercent(instrument.changePercent)}</span>
              </>
            );
            const classes = cn("grid h-[65px] grid-cols-[1.4fr_1fr_0.8fr] items-center border-t border-border-default px-3 first:border-t-0", instrument.symbol === "FPT" && "bg-surface-subtle");
            return instrument.symbol === "FPT" ? <Link key={instrument.symbol} href="/market/FPT" className={classes}>{content}</Link> : <div key={instrument.symbol} className={classes}>{content}</div>;
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Market quotes update every 500 milliseconds.</p>
    </>
  );
}
