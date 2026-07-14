"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
}

export function Dialog({ open, onOpenChange, title, children, className, dismissible = true }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onOpenChange(false);
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [dismissible, onOpenChange, open]);

  if (!open) return null;

  return (
    <div
      className="fixed right-0 bottom-0 left-0 top-0 z-50 flex items-center justify-center bg-scrim p-4 lg:left-[232px] lg:top-[72px]"
      onMouseDown={(event) => { if (dismissible && event.target === event.currentTarget) onOpenChange(false); }}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={cn("w-full max-w-[540px] overflow-y-auto rounded-[20px] border border-border-default bg-surface-raised text-primary shadow-[var(--elevation-md)] outline-none", className)}>
        <h2 id={titleId} className="sr-only">{title}</h2>
        {children}
      </div>
    </div>
  );
}
