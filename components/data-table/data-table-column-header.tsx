import { ArrowLineLeft, ArrowLineRight } from '@phosphor-icons/react'
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'
import { type Column } from '@tanstack/react-table'

import { cn } from '~/lib/styles'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  table?: Table<TData>
  title?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  table,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (column.id === 'select' && table) {
    return (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    )
  }
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn('whitespace-nowrap text-xs font-bold', className)}>{title}</div>
  }

  const togglePin = (position: 'left' | 'right') => {
    column.pin(column.getIsPinned() !== position ? position : false)
  }

  const getPinLabel = (position: 'left' | 'right') => {
    if (column.getIsPinned() === position) {
      return `Unpin from ${position}`
    }
    return `Pin to ${position}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="bg-transparent text-foreground">
        <Button
          aria-label={
            column.getIsSorted() === 'desc'
              ? 'Sorted descending. Click to sort ascending.'
              : column.getIsSorted() === 'asc'
                ? 'Sorted ascending. Click to sort descending.'
                : 'Not sorted. Click to sort ascending.'
          }
          size="sm"
          className="h-7 gap-1 text-sm uppercase shadow-none data-[state=open]:bg-black/10 dark:data-[state=open]:bg-white/10"
        >
          <span>{title}</span>
          {column.getCanSort() && column.getIsSorted() === 'desc' ? (
            <ArrowDownIcon className="size-4" aria-hidden="true" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUpIcon className="size-4" aria-hidden="true" />
          ) : (
            <CaretSortIcon className="size-4" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {column.getCanSort() && (
          <>
            <DropdownMenuItem aria-label="Sort ascending" onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="text-muted-foreground/70 mr-2 size-3.5" aria-hidden="true" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem aria-label="Sort descending" onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="text-muted-foreground/70 mr-2 size-3.5" aria-hidden="true" />
              Desc
            </DropdownMenuItem>
          </>
        )}
        {column.getCanSort() && column.getCanHide() && column.getCanPin() && <DropdownMenuSeparator />}
        {column.getCanPin() && (
          <>
            <DropdownMenuItem aria-label="Pin column to left" onClick={() => togglePin('left')}>
              <ArrowLineLeft size={14} className="text-muted-foreground/70 mr-2" aria-hidden="true" />
              {getPinLabel('left')}
            </DropdownMenuItem>
            <DropdownMenuItem aria-label="Pin column to right" onClick={() => togglePin('right')}>
              <ArrowLineRight size={14} className="text-muted-foreground/70 mr-2" aria-hidden="true" />
              {getPinLabel('right')}
            </DropdownMenuItem>
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuItem aria-label="Hide column" onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="text-muted-foreground/70 mr-2 size-3.5" aria-hidden="true" />
            Hide
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    // <div className={cn("flex items-center space-x-2", className)}>
    // </div>
  )
}
