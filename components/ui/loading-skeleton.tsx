import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type LoadingSkeletonVariant = "line" | "page" | "table";

export interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: LoadingSkeletonVariant;
  rows?: number;
  label?: string;
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block bg-surface-subtle motion-safe:animate-pulse",
        className,
      )}
    />
  );
}

export function LoadingSkeleton({
  className,
  variant = "line",
  rows = 5,
  label,
  ...props
}: LoadingSkeletonProps) {
  if (variant === "line") {
    return (
      <div
        role="status"
        aria-label={label ?? "Loading"}
        data-variant="line"
        className={cn(
          "h-[18px] w-full rounded-[6px] bg-surface-subtle motion-safe:animate-pulse",
          className,
        )}
        {...props}
      />
    );
  }

  if (variant === "page") {
    return (
      <div
        role="status"
        aria-label={label ?? "Page loading"}
        data-variant="page"
        className={cn(
          "flex min-h-[200px] w-full max-w-[656px] flex-col gap-[14px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[22px]",
          className,
        )}
        {...props}
      >
        <p className="type-heading-h3 text-primary">Page loading</p>
        <SkeletonBlock className="h-[18px] w-[340px] max-w-full rounded-[6px]" />
        <SkeletonBlock className="h-[18px] w-[520px] max-w-full rounded-[6px]" />
        <SkeletonBlock className="h-[18px] w-[480px] max-w-full rounded-[6px]" />
        <SkeletonBlock className="h-[18px] w-[610px] max-w-full rounded-[6px]" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label ?? "Table loading"}
      data-variant="table"
      className={cn(
        "flex min-h-[192px] w-full max-w-[656px] flex-col gap-[10px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[22px]",
        className,
      )}
      {...props}
    >
      <p className="type-heading-h3 text-primary">Table skeleton</p>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          aria-hidden="true"
          className="grid h-[14px] w-[530px] max-w-full grid-cols-[90fr_170fr_110fr_130fr] gap-[10px]"
        >
          <SkeletonBlock className="h-[14px] rounded-[5px]" />
          <SkeletonBlock className="h-[14px] rounded-[5px]" />
          <SkeletonBlock className="h-[14px] rounded-[5px]" />
          <SkeletonBlock className="h-[14px] rounded-[5px]" />
        </div>
      ))}
    </div>
  );
}
