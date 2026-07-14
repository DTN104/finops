import {
  useId,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { LucideProps } from "lucide-react";

import { cn } from "@/lib/utils";

type StateTone = "empty" | "error";

interface StatePanelProps extends HTMLAttributes<HTMLElement> {
  tone: StateTone;
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  metadata?: string;
  action?: ReactNode;
}

const toneClasses: Record<
  StateTone,
  { icon: string; metadata: string }
> = {
  empty: {
    icon: "bg-profit-bg text-profit",
    metadata: "text-profit",
  },
  error: {
    icon: "bg-loss-bg text-loss",
    metadata: "text-loss",
  },
};

export function StatePanel({
  tone,
  icon: Icon,
  title,
  description,
  metadata,
  action,
  className,
  ...props
}: StatePanelProps) {
  const generatedId = useId();
  const titleId = `state-title-${generatedId}`;
  const descriptionId = `state-description-${generatedId}`;

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        "flex min-h-[270px] w-full max-w-[656px] flex-col items-start gap-[14px] rounded-[var(--radius-lg)] border border-border-default bg-surface p-[var(--space-6)]",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-[14px]",
          toneClasses[tone].icon,
        )}
      >
        <Icon size={24} strokeWidth={2.25} />
      </span>
      <h2 id={titleId} className="type-heading-h2 text-primary">
        {title}
      </h2>
      <p id={descriptionId} className="type-body-m text-secondary">
        {description}
      </p>
      {metadata ? (
        <p className={cn("type-data-s", toneClasses[tone].metadata)}>
          {metadata}
        </p>
      ) : null}
      {action}
    </section>
  );
}
