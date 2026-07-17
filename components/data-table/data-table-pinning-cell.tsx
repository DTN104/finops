import { PushPin, PushPinSlash } from '@phosphor-icons/react'
import type { CellContext } from '@tanstack/react-table'

import { Button } from '~/components/ui/button'

interface DataTablePinningCellProps<TData, TValue> extends CellContext<TData, TValue> {}

export function DataTablePinningCell<TData, TValue>({ row }: DataTablePinningCellProps<TData, TValue>) {
  const isPinned = row.getIsPinned()
  const togglePin = () => {
    row.pin(row.getIsPinned() ? false : 'top')
  }

  const show = row.depth === 0

  return (
    show && (
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={togglePin}>
        {isPinned ? <PushPinSlash weight="fill" size={12} /> : <PushPin size={12} />}
      </Button>
    )
  )
}
