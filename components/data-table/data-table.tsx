import * as React from 'react'
import type { Row } from '@tanstack/react-table'
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import type { Filter } from '~/hooks/use-save-filters'
import type { ItemProps, TableComponents } from 'react-virtuoso'
import { TableVirtuoso } from 'react-virtuoso'

import { cn } from '~/lib/styles'
import { DataTablePagination } from '~/components/data-table/data-table-pagination'
import { getCommonPinningStyles, type Context } from '~/components/data-table/data-table-utils'
import { MenuSlider } from '~/components/menu-slider'
import { Button } from '~/components/ui/button'
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '~/components/ui/context-menu'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table'

import { DataTableRow, type RowProps } from './data-table-row'

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>
  floatingBar?: React.ReactNode | null
  footerSticky?: boolean
  hasPagination?: boolean
  contextMenuContent?: (row?: Row<TData>) => React.ReactNode
  onDoubleClickRow?: (row: Row<TData>) => void
  tooltipContent?: React.ReactNode | ((row?: Row<TData>) => React.ReactNode)
  setRowStyle?: (row: Row<TData>) => string
  defaultFilters?: Filter[]
}

interface TableRowProps<TData> extends ItemProps<TData> {
  context?: Context<TData>
}

const TableElement: TableComponents['Table'] = (props) => <Table {...props} />
const TableBodyElement: TableComponents['TableBody'] = React.forwardRef((props, ref) => (
  <TableBody {...props} ref={ref} />
))
const TableHeadElement: TableComponents['TableHead'] = React.forwardRef((props, ref) => (
  <TableHeader ref={ref} {...props} />
))
const TableFooterElement: TableComponents['TableFoot'] = React.forwardRef((props, ref) => (
  <TableFooter ref={ref} {...props} />
))
const TableRowElement = <TData,>({ context, ...props }: TableRowProps<TData>) => {
  const index = props['data-index']
  if (!context) return null
  const { table } = context
  const allRows = table.getCenterRows()
  const row = allRows[index]
  if (allRows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={table.getAllLeafColumns().length} className="h-24 text-center">
          Không có dữ liệu
        </TableCell>
      </TableRow>
    )
  }
  if (row) {
    const rowProps: RowProps<TData> = {
      row,
      context,
      rowIndex: index,
      ...props,
    }
    return <DataTableRow {...rowProps} />
  }
}

const FixedHeaderContent = <TData,>({
  table,
  getCommonPinningStyles,
  handleContextMenuRow,
  tooltipContent,
  onDoubleClickRow,
  setRowStyle,
}: Context<TData>) => {
  return (
    <>
      {table.getHeaderGroups().map((headerGroup, index) => (
        <TableRow
          key={headerGroup.id}
          className={cn(
            table.getHeaderGroups().length > 1 && index < table.getHeaderGroups().length - 1 && 'relative z-10'
          )}
          onContextMenu={(e) => {
            e.stopPropagation()
          }}
        >
          {headerGroup.headers.map((header) => {
            return (
              <TableHead
                key={header.id}
                colSpan={header.colSpan}
                className={cn(header.colSpan > 1 && 'border-x', 'h-12 bg-table-header p-3 px-0 text-sm text-black')}
                align={header.column.columnDef.meta?.alignment}
                data-pinned={header.column.getIsPinned()}
                // ref={(thElem) =>
                //   columnSizingHandler(thElem, table, header.column)
                // }
                style={{
                  ...getCommonPinningStyles(header.column),
                }}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            )
          })}
        </TableRow>
      ))}
      {table.getTopRows().map((row) => (
        <DataTableRow
          key={row.id}
          row={row}
          context={{
            table,
            handleContextMenuRow,
            getCommonPinningStyles,
            onDoubleClickRow,
            tooltipContent,
            setRowStyle,
          }}
          isPinningRow
          rowIndex={row.index}
        />
      ))}
    </>
  )
}

const FixedFooterContent = <TData,>({
  table,
  hasFooter,
  getCommonPinningStyles,
}: Pick<Context<TData>, 'table' | 'getCommonPinningStyles'> & {
  hasFooter: boolean
}) => {
  if (!hasFooter) return null

  return table.getFooterGroups().map((footerGroup) => (
    <TableRow key={footerGroup.id}>
      {footerGroup.headers.map((header) => (
        <TableHead
          key={header.id}
          className="text-base"
          align={header.column.columnDef.meta?.alignment}
          data-pinned={header.column.getIsPinned()}
          // ref={(thElem) => columnSizingHandler(thElem, table, header.column)}
          style={{ ...getCommonPinningStyles(header.column) }}
        >
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
        </TableHead>
      ))}
    </TableRow>
  ))
}
export function DataTable<TData>({
  table,
  floatingBar = null,
  children,
  className,
  hasPagination,
  contextMenuContent,
  onDoubleClickRow,
  tooltipContent,
  setRowStyle,
  defaultFilters,
  ...props
}: DataTableProps<TData>) {
  const [rowContext, setRowContext] = React.useState<Row<TData> | undefined>()
  const handleOpenContextMenuChange = (open: boolean) => {
    if (!open) {
      setRowContext(undefined)
    }
  }

  const handleContextMenuRow = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: Row<TData>) => {
    if (!contextMenuContent) {
      e.stopPropagation()
    } else {
      setRowContext(row)
    }
  }

  const hasFooter =
    table
      .getFooterGroups()
      .flatMap((group) => group.headers.map((header) => header.column.columnDef.footer))
      .filter(Boolean).length > 0
  const isShowFooterSection = hasPagination || (table.getFilteredSelectedRowModel().rows.length > 0 && !!floatingBar)

  const allRows = table.getRowModel().rows
  const centerRows = table.getCenterRows()

  const context = {
    table,
    handleContextMenuRow,
    getCommonPinningStyles,
    onDoubleClickRow,
    tooltipContent,
    setRowStyle,
  }

  const handleFilterColumn = (filter: Filter['columnFilters']) => {
    table.setColumnFilters(filter)
  }

  return (
    <div className={cn('flex h-full w-full flex-col gap-0 bg-background-overlay', className)} {...props}>
      {!!children && <div className="space-y-2">{children}</div>}
      <ContextMenu onOpenChange={handleOpenContextMenuChange}>
        <ContextMenuTrigger asChild disabled={!contextMenuContent}>
          <TableVirtuoso<TData>
            className="format-scroll mx-4 mt-2 h-full rounded-lg border"
            context={context}
            totalCount={centerRows.length || allRows.length || 1} // we set length === 1 to show the empty row
            components={{
              Table: TableElement,
              TableBody: TableBodyElement,
              TableRow: TableRowElement<TData>,
              TableHead: TableHeadElement,
              TableFoot: TableFooterElement,
            }}
            fixedHeaderContent={() => <FixedHeaderContent {...context} />}
            fixedFooterContent={() => <FixedFooterContent {...context} table={table} hasFooter={hasFooter} />}
            overscan={100}
          />
        </ContextMenuTrigger>
        {contextMenuContent?.(rowContext) && (
          <ContextMenuContent className="w-60">{contextMenuContent?.(rowContext)}</ContextMenuContent>
        )}
      </ContextMenu>
      {isShowFooterSection && (
        <div className="flex flex-col gap-2.5 border-accent bg-background-overlay px-4 py-2">
          <div className="flex flex-row items-center justify-center gap-2">
            <MenuSlider
              className="ml-8"
              content={
                defaultFilters &&
                defaultFilters.map((item) => {
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="ml-4 h-8 px-2 lg:px-3"
                      onClick={() => handleFilterColumn(item.columnFilters)}
                    >
                      {item.name}
                    </Button>
                  )
                })
              }
            />
            {hasPagination && <DataTablePagination table={table} />}
          </div>
          {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
        </div>
      )}
    </div>
  )
}
