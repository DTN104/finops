import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DataTableColumn<Row> {
  key: string;
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
}

export function DataTable<Row>({ caption, columns, rows, getRowKey, hideHeader = false }: { caption: string; columns: readonly DataTableColumn<Row>[]; rows: readonly Row[]; getRowKey: (row: Row) => string; hideHeader?: boolean }) {
  return (
    <table className="w-full table-fixed border-collapse type-data-s">
      <caption className="sr-only">{caption}</caption>
      <thead className={hideHeader ? "sr-only" : undefined}>
        <tr>{columns.map((column) => <th key={column.key} scope="col" className={cn("text-left font-medium text-muted", column.className)}>{column.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)} className="border-t border-border-default">
            {columns.map((column) => <td key={column.key} className={cn("h-[38px] text-secondary", column.className)}>{column.cell(row)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
