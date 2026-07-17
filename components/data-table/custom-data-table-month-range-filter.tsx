import { CalendarBlank } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { format, isValid, parse } from 'date-fns'

import { cn } from '~/lib/styles'
import { MonthPickerCaption } from '~/components/form/month-picker'
import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface DataTableDateRangeFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

interface DatePickerFilterProps<TData, TValue> {
  date: string
  columns?: Column<TData, TValue>
  disabled?: (date: Date) => boolean
}

function DatePickerFilter<TData, TValue>({ date: dateProps, columns, disabled }: DatePickerFilterProps<TData, TValue>) {
  const dateFormat = 'yyyy-MM'
  const date = dateProps || '' || undefined
  const parsedDate = date ? parse(date, dateFormat, new Date()) : undefined
  const isValidDate = parsedDate && isValid(parsedDate)
  return (
    <div className="space-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            className={cn(
              'h-8 min-w-[140px] justify-between bg-background-3 text-left font-normal',
              !isValidDate && 'text-muted-foreground'
            )}
          >
            {isValidDate ? format(parsedDate, dateFormat) : <span className="min-w-[84px] text-sm">Chọn tháng</span>}
            <CalendarBlank size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-50 w-auto min-w-[140px] p-0" align="start">
          <Calendar
            classNames={{
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100 aria-selected:text-background-1 text-foreground'
              ),
            }}
            initialFocus
            captionLayout="dropdown"
            components={{
              Caption: MonthPickerCaption,
              Day: () => null,
              WeekNumber: () => null,
              Head: () => <div className="hidden"></div>,
            }}
            fromYear={2000}
            toYear={2065}
            mode="single"
            defaultMonth={isValidDate ? parsedDate : undefined}
            selected={isValidDate ? parsedDate : undefined}
            onSelect={(date) => {
              columns?.setFilterValue(date ? format(date, dateFormat) : undefined)
            }}
            onMonthChange={(date) => {
              columns?.setFilterValue(format(date, dateFormat))
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function CustomDataTableMonthRangeFilter<TData, TValue>({
  column,
}: DataTableDateRangeFilterProps<TData, TValue>) {
  const date = (column?.getFilterValue() as string) ?? ''
  return (
    <div className="flex space-x-3">
      <DatePickerFilter date={date} columns={column} />
    </div>
  )
}
