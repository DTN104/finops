import { CalendarBlank } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { compareAsc, format, isValid } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '~/lib/styles'
import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DataTableDateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

interface DatePickerFilterProps<TData, TValue> {
  date: string | number
  columns?: Column<TData, TValue>
  type: keyof DateRange
  disabled?: (date: Date) => boolean
}

function DatePickerFilter<TData, TValue>({
  date: dateProps,
  columns,
  type,
  disabled,
}: DatePickerFilterProps<TData, TValue>) {
  const date = new Date(dateProps)
  const isValidDate = date && isValid(date)
  return (
    <div className="space-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            className={cn(
              'w-50 justify-start bg-background-3 text-left font-normal',
              !isValidDate && 'text-muted-foreground'
            )}
          >
            {isValidDate ? format(date, 'PPP') : <span className="w-50">Chọn ngày</span>}
            <CalendarBlank size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            classNames={{
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100 aria-selected:text-background-1 text-foreground'
              ),
            }}
            initialFocus
            mode="single"
            selected={date}
            onSelect={(date) => {
              columns?.setFilterValue((current: DateRange) => ({
                ...current,
                [type]: date?.getTime(),
              }))
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DataTableDateRangeFilter<TData, TValue>({ column }: DataTableDateRangeFilterProps<TData, TValue>) {
  const date =
    (column?.getFilterValue() as {
      from: string | number
      to: string | number
    }) ?? {}
  return (
    <div className="flex space-x-3">
      <DatePickerFilter date={date.from} columns={column} type="from" />
      <DatePickerFilter
        date={date.to}
        columns={column}
        type="to"
        disabled={(d) => {
          const from = date.from
          return compareAsc(d, new Date(from)) < 0
        }}
      />
    </div>
  )
}
