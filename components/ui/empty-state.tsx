import type { HTMLAttributes, ReactNode } from "react";
import { Circle } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";

export interface EmptyStateProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  metadata?: string;
  action?: ReactNode;
}

export function EmptyState(props: EmptyStateProps) {
  return <StatePanel tone="empty" icon={Circle} {...props} />;
}
