import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

import { StatePanel } from "@/components/ui/state-panel";

export interface ErrorStateProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description: string;
  metadata?: string;
  action?: ReactNode;
}

export function ErrorState(props: ErrorStateProps) {
  return <StatePanel role="alert" tone="error" icon={X} {...props} />;
}
