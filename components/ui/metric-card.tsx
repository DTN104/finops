import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type MetricCardTrend = "neutral" | "positive" | "negative" | "warning";

export interface MetricCardProps extends HTMLAttributes<HTMLElement> {
  trend?: MetricCardTrend;
  label?: string;
  value?: string;
  supporting?: string;
}

const trendClasses: Record<
  MetricCardTrend,
  { supporting: string; bar: string }
> = {
  neutral: { supporting: "text-muted", bar: "bg-border-strong" },
  positive: { supporting: "text-profit", bar: "bg-profit" },
  negative: { supporting: "text-loss", bar: "bg-loss" },
  warning: { supporting: "text-warning", bar: "bg-warning" },
};

const trendLabels: Record<MetricCardTrend, string> = {
  neutral: "Neutral trend",
  positive: "Positive trend",
  negative: "Negative trend",
  warning: "Warning trend",
};

export function MetricCard({
  className,
  trend = "neutral",
  label = "Net portfolio value",
  value = "₫1.284B",
  supporting = "+2.79% today",
  ...props
}: MetricCardProps) {
  return (
    <article
      data-trend={trend}
      className={cn(
        "flex h-[150px] w-[270px] max-w-full flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-border-default bg-surface p-[var(--space-4)]",
        className,
      )}
      {...props}
    >
      <p className="type-body-s text-secondary">{label}</p>
      <p className="type-data-l text-primary">{value}</p>
      <p className={cn("type-data-s", trendClasses[trend].supporting)}>
        <span className="sr-only">{trendLabels[trend]}: </span>
        {supporting}
      </p>
      <span
        data-slot="trend-bar"
        aria-hidden="true"
        className={cn(
          "h-1 w-[58px] rounded-[var(--radius-full)]",
          trendClasses[trend].bar,
        )}
      />
    </article>
  );
}
