import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { CellContext } from '@tanstack/react-table'
import { FormatEmptyField, getBranchNameByTransactionCd, getNextElementByIndex } from '~/helper/function'
import { useAdjustableTimer } from '~/hooks/use-adjustable-timer'
import usePrevious from '~/hooks/use-previous'
import { useTimeRemaining } from '~/hooks/use-time-remaining'
import moment from 'moment'

import { formatDigits, formatPercent } from '~/lib/format'
import { cn, lightDarkVar } from '~/lib/styles'
import { SLAStatus } from '~/components/SLAStatus'
import { Checkbox } from '~/components/ui/checkbox'

type DataTableCellProps<
  TData,
  TContainer extends React.ElementType<any, keyof React.JSX.IntrinsicElements> = 'div',
> = CellContext<TData, unknown> & ComponentPropsWithoutRef<TContainer>

function useHighlightChange<R extends HTMLElement = HTMLDivElement, V = any>(ref: React.RefObject<R>, value: V) {
  const preValue = usePrevious(value)

  useEffect(() => {
    if (ref.current && preValue && preValue !== value) {
      let parentEle = ref.current.parentElement
      while (parentEle && parentEle.tagName.toLocaleLowerCase() !== 'td') {
        parentEle = parentEle.parentElement
      }
      if (parentEle && parentEle.tagName.toLocaleLowerCase() === 'td') {
        parentEle.style.backgroundColor = lightDarkVar('background-overlay')
        setTimeout(() => {
          if (parentEle) {
            parentEle.style.backgroundColor = 'transparent'
          }
        }, 400)
      }
    }
  }, [value, preValue, ref.current])
}

export const DataTableDigitsCell = <TData,>({ cell }: DataTableCellProps<TData, 'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as number
  useHighlightChange(ref, value)

  return <div ref={ref}>{formatDigits(cell.getValue() as string)}</div>
}

export const DataTableDigitsUpDownCell = <TData,>({ cell }: DataTableCellProps<TData, 'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as number
  useHighlightChange(ref, value)

  return (
    <div ref={ref} className={cn('text-success', { 'text-danger': value < 0 })}>
      {formatDigits(cell.getValue() as string)}
    </div>
  )
}

export const DataTablePercentUpDownCell = <TData,>({
  cell,
  maximumFractionDigits = 7,
}: DataTableCellProps<TData, 'div'> & { maximumFractionDigits?: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as number
  useHighlightChange(ref, value)

  return (
    <div ref={ref} className={cn('text-success', { 'text-danger': value < 0 })}>
      {formatPercent(value, maximumFractionDigits)}
    </div>
  )
}

export const DataTablePercentCell = <TData,>({
  cell,
  maximumFractionDigits = 7,
}: DataTableCellProps<TData, 'div'> & { maximumFractionDigits?: number }) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as number
  useHighlightChange(ref, value)

  return <div ref={ref}>{formatPercent(value, maximumFractionDigits)}</div>
}

export const DataTableDateCell = <TData,>({ cell }: DataTableCellProps<TData, 'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as string
  const dateRender = moment(value).format('DD/MM/YYYY')
  useHighlightChange(ref, dateRender)

  return <div ref={ref}>{dateRender}</div>
}

export const DataTableTimeCell = <TData,>({ cell }: DataTableCellProps<TData, 'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as string
  const dateRender = moment(value).format('HH:mm:ss')
  useHighlightChange(ref, dateRender)

  return <div ref={ref}>{dateRender}</div>
}

export const DataTableDateTimeCell = <TData,>({ cell }: DataTableCellProps<TData, 'div'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = cell.getValue() as string
  const timeRender = moment(value).format('HH:mm')
  const dateRender = moment(value).format('DD/MM/yyyy')
  const dateTimeRender = dateRender + ' ' + timeRender
  useHighlightChange(ref, dateTimeRender)
  if (value) {
    return (
      <div className="max-w-30" ref={ref}>
        {dateTimeRender}
      </div>
    )
  } else {
    return '_'
  }
}

export const DataTableCheckboxCell = <TData,>({ row }: DataTableCellProps<TData>) => (
  <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={(value) => row.toggleSelected(!!value)}
    aria-label="Select row"
  />
)

export const DataTableIndexCell = <TData,>({ row, className }: DataTableCellProps<TData>) => {
  if (row.depth > 0) return null
  return <div className={cn(className)}>{row.index + 1}</div>
}

export const DataTableExpandableCell = <TData,>({
  className,
  limit = 100,
  value = '',
}: DataTableCellProps<TData, 'div'> & { limit?: number; value: string }) => {
  const [isExpanded, setIsExpanded] = useState(false) // State to manage expanded view
  const isExpandable = value.length > limit // Determine if the content is expandable
  const displayedText = isExpandable && !isExpanded ? value.slice(0, limit) + '...' : value // Truncated or full text

  return (
    <div
      className={cn(`max-w-auto cursor-pointer truncate whitespace-pre-wrap break-words text-left`, className)}
      onClick={() => isExpandable && setIsExpanded(!isExpanded)} // Toggle expanded state on click
      title={isExpandable ? 'Click to view full text' : ''}
    >
      {displayedText}
      {isExpandable && !isExpanded && <span className="text-blue-500">[Xem thêm]</span>}
    </div>
  )
}

export const DataTableExpandableMultiLineCell = <TData,>({
  value = '',
  limit = 100,
  className,
}: DataTableCellProps<TData, 'div'> & { limit?: number; value: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const noteArr = FormatEmptyField(value) !== '_' ? value.split('|') : []

  const joinedText = noteArr.join('\n')

  const isExpandable = joinedText.length > limit
  const displayedText = isExpandable && !isExpanded ? joinedText.slice(0, limit) + '...' : joinedText

  const lines = displayedText.split('\n')

  return (
    <div
      className={`max-w-auto cursor-pointer truncate whitespace-pre-wrap break-words text-left ${className || ''}`}
      onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      title={isExpandable ? 'Click để xem đầy đủ' : ''}
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {lines.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
      {isExpandable && !isExpanded && <span className="text-blue-500">[Xem thêm]</span>}
    </div>
  )
}

export const FormatBranchPNLCell = <TData,>({
  className,
  branchData,
  branchAPI,
}: DataTableCellProps<TData, 'div'> & {
  branchData: string[]
  branchAPI: { branch_code: string; branch_name: string; transaction_cd: string }[]
}) => {
  return (
    <div className={className}>
      {branchData !== null
        ? branchData.map((item, index) => {
            return (
              <div
                className={
                  'flex w-fit items-center justify-center space-x-2 space-y-2 rounded-lg border-transparent bg-[#EBF2FF] p-2 text-xs font-semibold text-primary'
                }
                key={item + index + 's2dsfd'}
              >
                {getBranchNameByTransactionCd(item, branchAPI)}
              </div>
            )
          })
        : ''}
    </div>
  )
}

export const DataTableCheckDeadlineCell = <TData,>({
  status_list,
  time_limit,
  created_at,
}: DataTableCellProps<TData, 'div'> & {
  status_list: {
    status: string
    created_by: string
    expiry_time: string
    time_limit: Date
    created_at: Date
  }[]
  time_limit: Date
  created_at: Date
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const result = useTimeRemaining(time_limit)

  // Compute the earliest created_at in the filtered status_list
  const filteredList = status_list.filter((item) => new Date(item.created_at) > new Date(created_at))
  const sortedList = [...filteredList].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const firstCreatedAt = sortedList[0]?.created_at ? new Date(sortedList[0].created_at) : undefined

  const newResult = useTimeRemaining(time_limit, firstCreatedAt)

  useHighlightChange(ref, result)

  const convert_time_limit = new Date(time_limit)
  const now = new Date()

  if (filteredList.length > 0) {
    if (firstCreatedAt && firstCreatedAt < convert_time_limit) {
      return <SLAStatus status="SUCCESS"> Hoàn thành </SLAStatus>
    } else {
      return (
        <SLAStatus status="EXPIRED">
          {' '}
          Quá hạn (<span className="font-bold">{newResult}</span>){' '}
        </SLAStatus>
      )
    }
  } else {
    if (now <= convert_time_limit) {
      return (
        <SLAStatus status="PENDING">
          {' '}
          Còn lại (<span className="font-bold">{result}</span>){' '}
        </SLAStatus>
      )
    } else {
      return (
        <SLAStatus status="EXPIRED">
          {' '}
          Quá hạn (<span className="font-bold">{result}</span>){' '}
        </SLAStatus>
      )
    }
  }
}

export const StatusProcessListCell = <TData,>({
  time_limit,
  status_list,
  status,
  index,
}: DataTableCellProps<TData, 'div'> & {
  time_limit: Date
  status_list: {
    status: string
    created_by: string
    expiry_time: string
    time_limit: Date
    created_at: Date
    sla_status: 'DONE' | 'PROCESS' | 'LATE' | null
  }[]
  status: string
  created_at: Date
  index: number
}) => {
  const convert_time_limit = new Date(time_limit)
  const now = new Date()

  const itemArr = status_list.map((item) => ({
    created_at: item.created_at,
    time_limit: item.time_limit,
    status: item.status,
  }))

  const nextEle = getNextElementByIndex(itemArr, index)
  const result = useTimeRemaining(time_limit)
  const newResult = useTimeRemaining(time_limit, nextEle?.created_at)

  if (nextEle) {
    const convert_created_at = new Date(nextEle.created_at)
    if (convert_created_at <= convert_time_limit) {
      return <SLAStatus status="SUCCESS"> Hoàn thành </SLAStatus>
    } else {
      return (
        <SLAStatus status="EXPIRED">
          {' '}
          Quá hạn (<span className="font-bold">{newResult}</span>){' '}
        </SLAStatus>
      )
    }
  } else {
    if (status === 'DONE') {
      return ''
    }
    if (now <= convert_time_limit) {
      return (
        <SLAStatus status="PENDING">
          {' '}
          Còn lại (<span className="font-bold">{result}</span>){' '}
        </SLAStatus>
      )
    } else {
      return (
        <SLAStatus status="EXPIRED">
          {' '}
          Quá hạn (<span className="font-bold">{result}</span>){' '}
        </SLAStatus>
      )
    }
  }
}

export const AdjustableTimerCell = <TData,>({
  expiry_time,
  time_process,
  isRunning,
  sla_status,
}: DataTableCellProps<TData, 'div'> & {
  expiry_time: string
  time_process: string
  isRunning: boolean
  sla_status: 'DONE' | 'PROCESS' | 'LATE' | null
}) => {
  const initial = sla_status === 'PROCESS' ? time_process : expiry_time
  const mode = sla_status === 'PROCESS' ? 'down' : 'up'
  const timer = useAdjustableTimer(initial, mode, isRunning)
  if (sla_status === 'DONE') {
    return <SLAStatus status="SUCCESS"> Hoàn thành </SLAStatus>
  }
  if (sla_status === 'LATE') {
    return (
      <SLAStatus status="EXPIRED">
        {' '}
        Quá hạn (<span className="font-bold">{timer}</span>){' '}
      </SLAStatus>
    )
  }
  if (sla_status === 'PROCESS') {
    return (
      <SLAStatus status="PENDING">
        {' '}
        Còn lại (<span className="font-bold">{timer}</span>){' '}
      </SLAStatus>
    )
  }
}

export const DataTableUrlCell = <TData,>({ cell, className }: DataTableCellProps<TData>) => {
  const ref = useRef<HTMLDivElement>(null)
  const value = (cell.getValue() as string) ?? ''
  useHighlightChange(ref, value)
  return (
    <>
      {value ? (
        <a className={cn('text-blue-500 underline', className)} href={value} target="_blank" rel="noreferrer">
          Xem
        </a>
      ) : (
        '_'
      )}
    </>
  )
}
