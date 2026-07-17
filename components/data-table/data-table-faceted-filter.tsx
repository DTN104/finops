import { CheckIcon } from '@radix-ui/react-icons'
import type { Column } from '@tanstack/react-table'
import type { Option } from '~/types'
import { ChevronDown, XCircle } from 'lucide-react'

import { cn } from '~/lib/styles'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '~/components/ui/command'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
  placeholder?: string
  enableSelectAll?: boolean
  selectAllLabel?: string
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  placeholder,
  enableSelectAll = false,
  selectAllLabel = 'Select All',
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set(column?.getFilterValue() as string[])
  const selectedOptions = options.filter((option) => selectedValues.has(option.value))
  const optionValues = options.map((option) => option.value)
  const isAllSelected = optionValues.length > 0 && optionValues.every((value) => selectedValues.has(value))

  const updateFilterValues = (values: string[]) => {
    column?.setFilterValue(values.length ? values : undefined)
  }

  const toggleOption = (value: string) => {
    const newSelectedValues = Array.from(selectedValues).includes(value)
      ? Array.from(selectedValues).filter((v) => v !== value)
      : [...selectedValues, value]
    updateFilterValues(newSelectedValues)
  }

  const toggleSelectAll = () => {
    updateFilterValues(isAllSelected ? [] : optionValues)
  }

  return (
    <Popover>
      <div className="flex flex-col gap-2">
        <Label>{title}</Label>
        <PopoverTrigger asChild>
          <Button variant="input" size="sm" className="min-h-9 justify-between">
            {selectedValues.size > 0 ? (
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex min-w-0 flex-row items-center gap-2">
                  {selectedOptions.slice(0, 1).map((option) => {
                    const IconComponent = option?.icon
                    return (
                      <Badge key={option.value} className="max-w-[11rem] rounded-sm px-2 py-1 text-xs font-normal">
                        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                        <div className="max-w-24 overflow-hidden text-ellipsis whitespace-nowrap">{option?.label}</div>
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(option.value)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedValues.size > 1 && (
                    <Badge variant="secondary" className="bg-active rounded-sm px-1 font-normal text-primary">
                      + {selectedValues.size}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-sm text-muted-foreground">{placeholder ?? title}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {enableSelectAll && (
                <CommandItem value={selectAllLabel} onSelect={toggleSelectAll}>
                  <div
                    className={cn(
                      'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                      isAllSelected ? 'bg-primary text-accent' : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className="size-4" aria-hidden="true" />
                  </div>
                  <span>{selectAllLabel}</span>
                </CommandItem>
              )}
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected ? 'bg-primary text-accent' : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="size-4" aria-hidden="true" />
                    </div>
                    {option.icon && <option.icon className="mr-2 size-4 text-muted-foreground" aria-hidden="true" />}
                    <span>{option.label}</span>
                    {option.withCount && column?.getFacetedUniqueValues().get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-sm">
                        {column.getFacetedUniqueValues().get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => updateFilterValues([])} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
