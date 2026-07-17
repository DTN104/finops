import { useState } from 'react'
import { useSearchParams } from '@remix-run/react'
import { Star, X } from '@phosphor-icons/react'
import type { Table } from '@tanstack/react-table'
import { useSaveFilters } from '~/hooks/use-save-filters'

import { cn } from '~/lib/styles'
import ConfirmDialog from '~/components/dialog/confirm-dialog'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DataTableSaveFiltersProps<TData> {
  isFiltered?: boolean
  table: Table<TData>
}
export function DataTableSaveFilters<TData>({ isFiltered, table }: DataTableSaveFiltersProps<TData>) {
  const [filterName, setFilterName] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const { filters: savedFilters, setFilter, saveFilter, removeFilter } = useSaveFilters(table)

  const handleSaveFilter = (id?: string | null) => {
    saveFilter({ name: filterName, id })
    setOpen(false)
  }

  const handleOpen = (open: boolean) => {
    const selectedFilterId = searchParams.get('filterId')
    const selectedFilter = savedFilters.find((f) => f.id === selectedFilterId)
    if (selectedFilter?.name) {
      setFilterName(selectedFilter.name)
    }
    setOpen(open)
  }

  const selectedFilterId = searchParams.get('filterId')

  return (
    <>
      {(isFiltered || selectedFilterId) && (
        <Popover open={open} onOpenChange={handleOpen}>
          <PopoverTrigger asChild>
            <Button aria-label="Save filter" variant="outline" className="h-8 px-2 lg:px-3">
              <Star size={16} />
              {selectedFilterId ? 'Update' : 'Save'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filter_name">Filter name</Label>
              <Input
                onChange={(e) => setFilterName(e.target.value)}
                value={filterName}
                id="filter_name"
                placeholder="Default search"
                className="h-8"
              />
            </div>
            <div className="space-x-3">
              <Button onClick={() => handleSaveFilter(selectedFilterId)} disabled={!filterName}>
                {selectedFilterId ? 'Update' : 'Save'}
              </Button>
              {selectedFilterId && (
                <Button onClick={() => handleSaveFilter()} disabled={!filterName}>
                  Save as new
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {savedFilters.length > 0 &&
        savedFilters.map(({ name, id }) => (
          <Badge
            key={id}
            variant={selectedFilterId === id ? 'default' : 'outline'}
            className="h-8 cursor-pointer gap-1 whitespace-nowrap rounded-full pl-3 pr-1"
            onClick={() => setFilter(id)}
          >
            {name}
            <ConfirmDialog
              title="Xoá filter"
              description={`Xác nhận xoá filter ${name}`}
              onSubmit={() => removeFilter(id)}
              renderTrigger={
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn('h-6 w-6 rounded-full', selectedFilterId === id && 'text-secondary')}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <X />
                </Button>
              }
            />
          </Badge>
        ))}
    </>
  )
}
