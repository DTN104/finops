import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ActionLinkProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
  size?: "medium" | "large";
  variant?: "primary" | "secondary";
}

export function ActionLink({ children, className, size = "medium", variant = "primary", ...props }: ActionLinkProps) {
  return (
    <Link
      className={cn(
        "type-label-l inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]",
        size === "large" ? "h-12 px-5" : "h-10 px-4",
        variant === "primary"
          ? "border-transparent bg-brand text-on-brand hover:bg-brand-hover"
          : "border-border-default bg-surface-raised text-primary hover:border-border-strong hover:bg-surface-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
