import * as React from 'react'
import { CalendarBlank } from '@phosphor-icons/react'
import type { Column } from '@tanstack/react-table'
import { endOfDay, format, isValid, startOfDay } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { cn } from '~/lib/styles'
import { Button, buttonVariants } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface CustomDataTableDateOnlyFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  placeHolder?: string
  label?: string
}

export function CustomDataTableDateOnlyFilter<TData, TValue>({
  column,
  label,
  placeHolder = 'Chọn ngày',
}: CustomDataTableDateOnlyFilterProps<TData, TValue>) {
  // Change to store a single date instead of a range
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    column?.getFilterValue() ? new Date((column?.getFilterValue() as any)?.from) : undefined
  )

  React.useEffect(() => {
    if (selectedDate) {
      // Convert single date to a range from start of day to end of day
      const dateRange: DateRange = {
        from: startOfDay(selectedDate),
        to: endOfDay(selectedDate),
      }
      column?.setFilterValue(dateRange)
      console.log('single date selected => ' + JSON.stringify(dateRange))
    } else {
      column?.setFilterValue(undefined)
    }
  }, [selectedDate, column])

  const isValidDate = selectedDate && isValid(selectedDate)
  const defaultMonth = selectedDate || new Date()
  const today = new Date()

  return (
    <div className="flex flex-col items-start gap-2">
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="input"
            className={cn(
              'relative w-[150px] justify-start text-left font-normal',
              !isValidDate && 'text-muted-foreground'
            )}
          >
            {isValidDate ? format(selectedDate!, 'dd/MM/yyyy') : <span>{placeHolder}</span>}
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
            }}
            initialFocus
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={defaultMonth}
            numberOfMonths={1}
            disabled={(date) => date > today}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
