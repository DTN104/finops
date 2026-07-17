import type React from 'react'
import { MixIcon, SquareIcon } from '@radix-ui/react-icons'
import type { Column, Row, Table } from '@tanstack/react-table'

export interface Context<TData> {
  table: Table<TData>
  tooltipContent?: React.ReactNode | ((row?: Row<TData>) => React.ReactNode)
  handleContextMenuRow: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: Row<TData>) => void
  getCommonPinningStyles: (column: Column<TData>) => React.CSSProperties
  onDoubleClickRow?: (row: Row<TData>) => void
  enableResizing?: boolean
  setRowStyle?: (row: Row<TData>) => string
}

/**
 * Calculate the column sizing and update the state
 * Reference: https://github.com/TanStack/table/discussions/3947#discussioncomment-9564867
 * @param {HTMLTableCellElement} thElem
 * @param {Table<TData>} table
 * @param {Column<TData>} column
 * @returns
 */
export const columnSizingHandler = <TData>(
  thElem: HTMLTableCellElement | null,
  table: Table<TData>,
  column: Column<TData>
) => {
  if (!thElem) return
  // If you don't do that, there will be an infinite loop. We update the value in state only if the value has actually changed.
  if (table.getState().columnSizing[column.id] === thElem.getBoundingClientRect().width) return

  table.setColumnSizing((prevSizes) => ({
    ...prevSizes,
    // 100% accurate float-point width, even if table content is loaded async
    [column.id]: thElem.getBoundingClientRect().width,
  }))
}

/**
 * Calculate the common pinning styles for a column
 * @param {Column<TData>} column
 * @returns
 */
export const getCommonPinningStyles = <TData>(column: Column<TData>): React.CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxShadow: isLastLeftPinnedColumn
      ? '-4px 0 4px -4px gray inset'
      : isFirstRightPinnedColumn
        ? '4px 0 4px -4px gray inset'
        : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

export const onlyShowAtRootDepth = ({ depth }: { depth: number }) => depth === 0

/**
 * Check the value of all sub row, if it all the same, we will display the value on parent row, otherwise hide it
 * @param originalSubRows
 * @param key
 * @returns
 */
export const allSubRowIsSame = (originalSubRows: any[] = [], isSame: (a: any, b: any) => boolean) => {
  if (originalSubRows.length === 0) {
    return true
  }
  const firstSubRow = originalSubRows[0]
  return originalSubRows.every((subRow) => isSame(subRow, firstSubRow))
}

export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  comparisonOperators: [
    { label: 'Contains', value: 'ilike' as const },
    { label: 'Does not contain', value: 'notIlike' as const },
    { label: 'Is', value: 'eq' as const },
    { label: 'Is not', value: 'notEq' as const },
    { label: 'Starts with', value: 'startsWith' as const },
    { label: 'Ends with', value: 'endsWith' as const },
    { label: 'Is empty', value: 'isNull' as const },
    { label: 'Is not empty', value: 'isNotNull' as const },
  ],
  selectableOperators: [
    { label: 'Is', value: 'eq' as const },
    { label: 'Is not', value: 'notEq' as const },
    { label: 'Is empty', value: 'isNull' as const },
    { label: 'Is not empty', value: 'isNotNull' as const },
  ],
  logicalOperators: [
    {
      label: 'And',
      value: 'and' as const,
      description: 'All conditions must be met',
    },
    {
      label: 'Or',
      value: 'or' as const,
      description: 'At least one condition must be met',
    },
  ],
  featureFlags: [
    {
      label: 'Advanced filter',
      value: 'advancedFilter' as const,
      icon: MixIcon,
      tooltipTitle: 'Toggle advanced filter',
      tooltipDescription: 'A notion like query builder to filter rows.',
    },
    {
      label: 'Floating bar',
      value: 'floatingBar' as const,
      icon: SquareIcon,
      tooltipTitle: 'Toggle floating bar',
      tooltipDescription: 'A floating bar that sticks to the top of the table.',
    },
  ],
}
