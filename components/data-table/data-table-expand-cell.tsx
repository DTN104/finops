import { ChevronRightIcon } from '@radix-ui/react-icons'
import type { Row, Table } from '@tanstack/react-table'

import { cn } from '~/lib/styles'
import { Button } from '~/components/ui/button'

interface DataTableExpandCellProps<TData> {
  row?: Row<TData>
  table?: Table<TData>
}

export function DataTableExpandCell<TData>({ row, table }: DataTableExpandCellProps<TData>) {
  if (!row && !table) return null

  const isExpanded = row ? row.getIsExpanded() : table?.getIsAllRowsExpanded()
  const canExpand = row ? row.getCanExpand() : true
  const toggleHandler = row ? row.getToggleExpandedHandler() : table?.getToggleAllRowsExpandedHandler()

  if (!canExpand || !toggleHandler) return null

  return (
    <Button
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        toggleHandler(e)
      }}
      size="icon"
      variant="ghost"
      className="h-6 w-6"
      aria-label={isExpanded ? 'Collapse' : 'Expand'}
    >
      <ChevronRightIcon className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-90')} />
    </Button>
  )
}
