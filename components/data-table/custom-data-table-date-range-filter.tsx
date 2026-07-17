import { CalendarBlank } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { format, isValid } from 'date-fns'

import { cn } from '~/lib/styles'
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
  const dateFormat = 'dd/MM/yyyy'
  const date = dateProps
  const isValidDate = date && isValid(new Date(Number(date)))
  return (
    <div className="space-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            className={cn('h-8 min-w-[140px] justify-between bg-background-3 text-left font-normal')}
          >
            {isValidDate ? format(new Date(Number(date)), 'dd/MM/yyyy') : format(new Date(), dateFormat)}
            <CalendarBlank size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto min-w-[150px] p-0" align="start">
          <Calendar
            classNames={{
              day: cn(
                buttonVariants({ variant: 'ghost' }),
                'h-8 w-8 p-0 font-normal aria-selected:opacity-100 aria-selected:text-background-1 text-foreground'
              ),
            }}
            initialFocus
            mode="single"
            defaultMonth={isValidDate ? new Date(Number(date)) : new Date()}
            selected={isValidDate ? new Date(Number(date)) : new Date()}
            onSelect={(date) => {
              columns?.setFilterValue(date ? date.getTime().toString() : undefined)
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function CustomDataTableDateRangeFilter<TData, TValue>({
  column,
}: DataTableDateRangeFilterProps<TData, TValue>) {
  const date = (column?.getFilterValue() as string) ?? ''
  return (
    <div className="flex space-x-3">
      <DatePickerFilter date={date} columns={column} />
    </div>
  )
}
