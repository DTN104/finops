import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type StatusBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";
export type StatusBadgeVariant = "soft" | "solid";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusBadgeTone;
  variant?: StatusBadgeVariant;
  label: string;
}

const softClasses: Record<StatusBadgeTone, string> = {
  neutral:
    "border-border-default bg-surface-subtle text-secondary [&_[data-slot=dot]]:bg-secondary",
  info: "border-transparent bg-info-bg text-info [&_[data-slot=dot]]:bg-info",
  success:
    "border-transparent bg-profit-bg text-profit [&_[data-slot=dot]]:bg-profit",
  warning:
    "border-transparent bg-warning-bg text-warning [&_[data-slot=dot]]:bg-warning",
  danger:
    "border-transparent bg-loss-bg text-loss [&_[data-slot=dot]]:bg-loss",
};

const solidClasses: Record<StatusBadgeTone, string> = {
  neutral:
    "border-transparent bg-[var(--finops-slate-600)] text-[var(--finops-white)] [&_[data-slot=dot]]:bg-[var(--finops-white)]",
  info:
    "border-transparent bg-info text-[var(--finops-white)] [&_[data-slot=dot]]:bg-[var(--finops-white)]",
  success:
    "border-transparent bg-profit text-[var(--finops-navy-950)] [&_[data-slot=dot]]:bg-[var(--finops-navy-950)]",
  warning:
    "border-transparent bg-warning text-[var(--finops-navy-950)] [&_[data-slot=dot]]:bg-[var(--finops-navy-950)]",
  danger:
    "border-transparent bg-loss text-[var(--finops-white)] [&_[data-slot=dot]]:bg-[var(--finops-white)]",
};

export function StatusBadge({
  className,
  tone = "neutral",
  variant = "soft",
  label,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      data-tone={tone}
      data-style={variant}
      className={cn(
        "type-label-m inline-flex h-[30px] w-fit shrink-0 items-center gap-[6px] rounded-[var(--radius-full)] border px-[10px] py-[6px] whitespace-nowrap",
        variant === "soft" ? softClasses[tone] : solidClasses[tone],
        className,
      )}
      {...props}
    >
      <span
        data-slot="dot"
        aria-hidden="true"
        className="size-[7px] shrink-0 rounded-[var(--radius-full)]"
      />
      {label}
    </span>
  );
}
