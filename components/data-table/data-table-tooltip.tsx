import { type PropsWithChildren } from 'react'
import { useMouse } from '~/hooks/use-mouse'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export const DataTableTooltip = ({ children, content }: PropsWithChildren & { content?: React.ReactNode }) => {
  const { ref, x, y } = useMouse()

  if (!content) return children
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip>
        <TooltipTrigger asChild ref={ref}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={x + 10}
          sideOffset={-y - 40}
          hideWhenDetached
          className="rounded-lg border bg-card text-xs text-primary"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
