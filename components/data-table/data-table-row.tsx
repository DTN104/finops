import type { Cell, Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import { useDoubleTap } from '~/hooks/use-double-tap'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/styles'
import { type Context } from '~/components/data-table/data-table-utils'
import { TableCell, TableRow } from '~/components/ui/table'

import { DataTableTooltip } from './data-table-tooltip'

const rowVariants = cva('border-b transition-colors hover:bg-muted/50', {
  variants: {
    depth: {
      0: '',
      1: 'bg-row-depth-1 opacity-60',
      2: 'bg-row-depth-2 opacity-40',
    },
    stripe: {
      even: 'bg-table-even-row',
      odd: 'bg-table-odd-row',
    },
  },
  compoundVariants: [
    {
      depth: 0,
      stripe: 'even',
      class: 'background-overlay',
    },
    {
      depth: 0,
      stripe: 'odd',
      class: 'bg-row-odd',
    },
  ],
  defaultVariants: {
    depth: 0,
  },
})

export interface RowProps<TData> extends Omit<VariantProps<typeof rowVariants>, 'depth'> {
  row: Row<TData>
  context: Context<TData>
  rowIndex: number
  hideCells?: string[]
  className?: string
  isPinningRow?: boolean
}

type RowStrategy<TData> = {
  getDepth: (row: Row<TData>) => number
  shouldHandleContextMenu: (row: Row<TData>) => boolean
  getCellContent: (cell: Cell<TData, unknown>, depth: number) => React.ReactNode
}

const rowStrategy: RowStrategy<any> = {
  getDepth: (row) => row.depth,
  shouldHandleContextMenu: (row) => row.depth === 0,
  getCellContent: (cell, depth) => {
    const shouldShow = cell.column.columnDef.meta?.shouldShow
    const originalSubRows = cell.row.originalSubRows
    const isVisible = shouldShow?.({ depth, originalSubRows }) ?? true
    return isVisible && flexRender(cell.column.columnDef.cell, cell.getContext())
  },
}

export const DataTableRow = <TData,>({
  row,
  context,
  rowIndex,
  className,
  isPinningRow,
  ...props
}: RowProps<TData> & { rowStrategy?: RowStrategy<TData> }) => {
  const handleDoubleTap = useDoubleTap(() => context.onDoubleClickRow?.(row))
  const { handleContextMenuRow, getCommonPinningStyles } = context

  const depth = rowStrategy.getDepth(row) as 0 | 1

  return (
    <DataTableTooltip
      content={
        context.tooltipContent
          ? typeof context.tooltipContent === 'function'
            ? context.tooltipContent(row)
            : context.tooltipContent
          : undefined
      }
    >
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        onContextMenu={(e) => rowStrategy.shouldHandleContextMenu(row) && handleContextMenuRow(e, row)}
        onPointerDown={(e) => rowStrategy.shouldHandleContextMenu(row) && handleContextMenuRow(e, row)}
        className={cn(
          rowVariants({
            depth,
            stripe: depth === 0 ? (rowIndex % 2 ? 'odd' : 'even') : undefined,
          }),
          isPinningRow && '!bg-background brightness-150',
          context.onDoubleClickRow && 'cursor-pointer',
          className
        )}
        {...handleDoubleTap}
        {...props}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={`${(row.original as { id: string }).id}-${cell.id}`}
            align={cell.column.columnDef.meta?.alignment}
            data-pinned={cell.column.getIsPinned()}
            className={cn('w-auto whitespace-nowrap', getCommonPinningStyles(cell.column))}
          >
            {rowStrategy.getCellContent(cell, depth)}
          </TableCell>
        ))}
      </TableRow>
    </DataTableTooltip>
  )
}
