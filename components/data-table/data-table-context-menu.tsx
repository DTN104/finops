import type { PropsWithChildren } from 'react'

import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '~/components/ui/context-menu'

interface DataTableContextMenuProps extends PropsWithChildren {
  content: React.ReactNode
}
export function DataTableContextMenu({ children, content }: DataTableContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>{content}</ContextMenuContent>
    </ContextMenu>
  )
}
