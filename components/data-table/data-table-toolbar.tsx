import * as React from 'react'
import { useSearchParams } from '@remix-run/react'
import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'
import type { DataTableFilterField } from '~/types'

import { cn } from '~/lib/styles'
import { DataTableFacetedFilter } from '~/components/data-table/data-table-faceted-filter'
import { DataTableViewOptions } from '~/components/data-table/data-table-view-options'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

import { CustomDataTableDateOnlyFilter } from './custom-data-table-date-only-filter'
import { CustomDataTableDateRangeFilter } from './custom-data-table-date-range-filter'
import { DataTableDateRangeFilterCombined } from './custom-data-table-date-range-filter-combined'
import { CustomDataTableMonthRangeFilter } from './custom-data-table-month-range-filter'
import { DataTableSaveFilters } from './data-table-save-filters'

interface DataTableToolbarProps<TData> extends React.PropsWithChildren<React.ComponentPropsWithoutRef<'div'>> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
  hideViewOptions?: boolean
  enableSaveFilter?: boolean
  action?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  hideViewOptions,
  action,
  enableSaveFilter = false,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [_, _setSearchParams] = useSearchParams()

  const {
    searchableColumns,
    filterableColumns,
    dateRangeColumns,
    customDateRangeColumns,
    customMonthRangeColumns,
    dateOnlyColumns,
  } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => field.type === 'search'),
      filterableColumns: filterFields.filter((field) => field.type === 'filter'),
      dateRangeColumns: filterFields.filter((field) => field.type === 'dateRange'),
      customDateRangeColumns: filterFields.filter((field) => field.type === 'customDateRange'),
      customMonthRangeColumns: filterFields.filter((field) => field.type === 'customMonthRange'),
      dateOnlyColumns: filterFields.filter((field) => field.type === 'dateOnly'),
    }
  }, [filterFields])

  const handleReset = () => {
    table.resetColumnFilters()
  }
  return (
    <div
      className={cn(
        'mt-2 flex w-full items-end justify-between space-x-3 overflow-auto bg-background-overlay px-4 py-2',
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-end space-x-3">
        {dateRangeColumns.length > 0 &&
          dateRangeColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <DataTableDateRangeFilterCombined
                  key={String(column.value)}
                  column={table.getColumn(column.value ? String(column.value) : '')}
                  placeHolder={column.placeholder}
                />
              )
          )}
        {dateOnlyColumns.length > 0 &&
          dateOnlyColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <CustomDataTableDateOnlyFilter
                  key={String(column.value)}
                  column={table.getColumn(column.value ? String(column.value) : '')}
                  placeHolder={column.placeholder}
                  label={column.label}
                />
              )
          )}
        {customDateRangeColumns.length > 0 &&
          customDateRangeColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <CustomDataTableDateRangeFilter
                  key={String(column.value)}
                  column={table.getColumn(column.value ? String(column.value) : '')}
                  title={column.label}
                />
              )
          )}
        {customMonthRangeColumns.length > 0 &&
          customMonthRangeColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <CustomDataTableMonthRangeFilter
                  key={String(column.value)}
                  column={table.getColumn(column.value ? String(column.value) : '')}
                  title={column.label}
                />
              )
          )}
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <div key={String(column.value)} className="flex flex-col space-y-2">
                  <Label>{column.label}</Label>
                  <Input
                    key={String(column.value)}
                    placeholder={column.placeholder}
                    value={(table.getColumn(String(column.value))?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn(String(column.value))?.setFilterValue(event.target.value)}
                    className="min-h-9 w-40"
                  />
                </div>
              )
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.value ? String(column.value) : '') && (
                <DataTableFacetedFilter
                  placeholder={column.placeholder}
                  key={String(column.value)}
                  column={table.getColumn(column.value ? String(column.value) : '')}
                  title={column.label}
                  options={column.options ?? []}
                  enableSelectAll={column.enableSelectAll}
                  selectAllLabel={column.selectAllLabel}
                />
              )
          )}
        {enableSaveFilter && <DataTableSaveFilters isFiltered={isFiltered} table={table} />}
        {enableSaveFilter && isFiltered && (
          <Button aria-label="Reset filters" variant="ghost" className="h-8 px-2 lg:px-3" onClick={handleReset}>
            Reset
            <Cross2Icon className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      {children}
      <div className="flex items-center gap-6">
        {action}
        {!hideViewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  )
}
