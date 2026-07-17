import * as React from 'react'
import { CalendarBlank } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { format, isValid } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '~/lib/styles'
import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DataTableDateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  placeHolder?: string
}

export function DataTableDateRangeFilterCombined<TData, TValue>({
  column,
  placeHolder = 'Chọn ngày',
}: DataTableDateRangeFilterProps<TData, TValue>) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(column?.getFilterValue() as DateRange)

  React.useEffect(() => {
    column?.setFilterValue(dateRange)
  }, [dateRange, column])

  const isValidFrom = dateRange?.from && isValid(new Date(dateRange.from))
  const isValidTo = dateRange?.to && isValid(new Date(dateRange.to))
  const defaultMonth = dateRange?.from ? new Date(dateRange.from) : new Date()
  const today = new Date()

  return (
    <div className="flex items-center space-x-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            className={cn(
              'relative w-[240px] justify-start bg-background-3 text-left font-normal',
              !isValidFrom && !isValidTo && 'text-muted-foreground'
            )}
          >
            {isValidFrom ? (
              isValidTo ? (
                <>
                  {format(new Date(dateRange!.from!), 'dd/MM/yyyy')} - {format(new Date(dateRange!.to!), 'dd/MM/yyyy')}
                </>
              ) : (
                format(new Date(dateRange!.from!), 'dd/MM/yyyy')
              )
            ) : (
              <span>{placeHolder}</span>
            )}
            <CalendarBlank className="absolute right-2" size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-row p-0" align="start">
          <Calendar
            classNames={{
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100 aria-selected:text-background-1 text-foreground'
              ),
              cell: cn(
                'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-active [&:has([aria-selected].day-range-end)]:rounded-r-full',
                '[&:has(>.day-range-end)]:rounded-r-full [&:has(>.day-range-start)]:rounded-l-full first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full'
              ),
              day_today: 'rounded-b-none border-b-2 border-primary aria-selected:border-4 aria-selected:border-active',
              day_selected:
                'bg-primary text-primary-foreground border-4 border-active hover:border-active hover:!bg-primary hover:opacity-50 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground !rounded-full [&:has(.day-outside)]:bg-active',
              day_range_middle: 'aria-selected:bg-active aria-selected:text-primary',
              day_range_start: 'day-range-start border-4 border-active rounded-full',
              day_range_end: 'day-range-end border-4 border-active rounded-full',
              day_outside:
                'day-outside text-gray-100 focus:bg-none aria-selected:opacity-20 aria-selected:text-gray-100 aria-selected:bg-transparent pointer-events-none [&:has(>.day-selected)]:bg-none',
            }}
            initialFocus
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setDateRange(range)
            }}
            defaultMonth={defaultMonth}
            numberOfMonths={2}
            disabled={(date) => date > today}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
