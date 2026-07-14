import Link from "next/link";

import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
  markSize?: "small" | "medium";
  linked?: boolean;
}

export function Brand({ className, markSize = "medium", linked = true }: BrandProps) {
  const content = (
    <>
      <span className={cn("flex shrink-0 items-center justify-center rounded-[8px] bg-brand font-medium text-on-brand", markSize === "small" ? "size-7 type-label-l" : "size-8 type-label-l")}>
        F
      </span>
      <span className="type-heading-h3">FinOps</span>
    </>
  );
  const classes = cn("inline-flex items-center gap-3 text-primary", className);

  return linked ? <Link href="/" className={classes}>{content}</Link> : <div className={classes}>{content}</div>;
}
