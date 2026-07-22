import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<Row> {
  caption: string;
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row) => string;
  getRowProps?: (row: Row) => HTMLAttributes<HTMLTableRowElement>;
  hideHeader?: boolean;
  className?: string;
  headerClassName?: string;
}

export function DataTable<Row>({ caption, columns, rows, getRowKey, getRowProps, hideHeader = false, className, headerClassName }: DataTableProps<Row>) {
  return (
    <table className={cn("w-full table-fixed border-collapse type-data-s", className)}>
      <caption className="sr-only">{caption}</caption>
      <thead className={cn(headerClassName, hideHeader && "sr-only")}>
        <tr>{columns.map((column) => <th key={column.key} scope="col" className={cn("text-left font-medium text-muted", column.className, column.headerClassName)}>{column.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const rowProps = getRowProps?.(row);
          return (
            <tr {...rowProps} key={getRowKey(row)} className={cn("border-t border-border-default", rowProps?.className)}>
              {columns.map((column) => <td key={column.key} className={cn("h-[38px] text-secondary", column.className, column.cellClassName)}>{column.cell(row)}</td>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
