import type React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table'

interface DataTableSimpleListProps<TData, TValue> extends React.ComponentPropsWithoutRef<'table'> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
export function DataTableSimpleList<TData, TValue>({ data, columns }: DataTableSimpleListProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} align={cell.column.columnDef.meta?.alignment}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length}>No data</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
