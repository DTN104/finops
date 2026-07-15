"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Drawer({ open, onOpenChange, title, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode; className?: string }) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-scrim lg:left-[232px] lg:top-[72px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onOpenChange(false); }}>
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className={cn("absolute right-0 top-0 h-full w-full max-w-[500px] overflow-y-auto border-l border-border-default bg-surface-raised p-6 shadow-[var(--elevation-md)] outline-none lg:p-8", className)}>
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="type-heading-h2">{title}</h2>
          <button type="button" aria-label="Close detail drawer" onClick={() => onOpenChange(false)} className="rounded-[var(--radius-xs)] p-1 text-muted focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]"><X size={20} /></button>
        </div>
        {children}
      </aside>
    </div>
  );
}
