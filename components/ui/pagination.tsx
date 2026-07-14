"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  const visiblePages = Array.from(new Set([0, 1, 2, page - 1, page, page + 1, pageCount - 1])).filter((candidate) => candidate >= 0 && candidate < pageCount).sort((a, b) => a - b);

  return (
    <nav aria-label="Market table pages" className={cn("flex items-center gap-[6px]", className)}>
      <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPageChange(page - 1)} className="size-8 rounded-full bg-canvas type-data-s text-secondary disabled:text-text-disabled">‹</button>
      {visiblePages.map((candidate, index) => {
        const previous = visiblePages[index - 1];
        const showEllipsis = previous !== undefined && candidate - previous > 1;
        return (
          <span key={candidate} className="contents">
            {showEllipsis ? <span className="flex size-8 items-center justify-center rounded-full bg-canvas type-data-s text-secondary">…</span> : null}
            <button
              type="button"
              aria-current={candidate === page ? "page" : undefined}
              aria-label={`Page ${candidate + 1}`}
              onClick={() => onPageChange(candidate)}
              className={cn("flex size-8 items-center justify-center rounded-full type-data-s", candidate === page ? "bg-brand text-on-brand" : "bg-canvas text-secondary")}
            >
              {candidate + 1}
            </button>
          </span>
        );
      })}
      <button type="button" aria-label="Next page" disabled={page >= pageCount - 1} onClick={() => onPageChange(page + 1)} className="size-8 rounded-full bg-canvas type-data-s text-secondary disabled:text-text-disabled">›</button>
    </nav>
  );
}
