"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import {
  Button,
  EmptyState,
  ErrorState,
  FormField,
  LoadingSkeleton,
  MetricCard,
  StatusBadge,
  type ButtonSize,
  type ButtonState,
  type ButtonVariant,
  type FormFieldState,
  type FormFieldType,
  type MetricCardTrend,
  type StatusBadgeTone,
  type StatusBadgeVariant,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const buttonSizes: ButtonSize[] = ["small", "medium", "large"];
const buttonVariants: ButtonVariant[] = ["primary", "secondary", "danger"];
const buttonStates: ButtonState[] = ["default", "hover", "disabled"];
const fieldTypes: FormFieldType[] = ["text", "search", "select"];
const fieldStates: FormFieldState[] = [
  "default",
  "focus",
  "error",
  "disabled",
];
const badgeTones: StatusBadgeTone[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
];
const badgeVariants: StatusBadgeVariant[] = ["soft", "solid"];
const trends: MetricCardTrend[] = [
  "neutral",
  "positive",
  "negative",
  "warning",
];

const sections = [
  "Button",
  "Form Field",
  "Status Badge",
  "Metric Card",
  "Loading Skeleton",
  "Empty & Error",
];

const selectOptions = [
  { label: "Input value", value: "input" },
  { label: "Secondary value", value: "secondary" },
];

function sectionId(label: string) {
  return label.toLowerCase().replaceAll(" ", "-").replace("&", "and");
}

function SpecimenLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="type-data-s mb-[var(--space-2)] text-muted">{children}</p>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={sectionId(title)}
      className="scroll-mt-24 border-t border-border-default py-[var(--space-10)]"
    >
      <h2 className="type-heading-h2 mb-[var(--space-8)] text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ComponentPreview() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <div data-theme={theme} className="min-h-screen bg-canvas text-primary">
      <header className="sticky top-0 z-10 border-b border-border-default bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-[var(--space-4)] px-[var(--space-6)] sm:px-[var(--space-10)]">
          <div className="min-w-0">
            <p className="type-label-m text-muted">FINOPS / PHASE 1</p>
            <h1 className="type-heading-h3 truncate text-primary">
              Component library
            </h1>
          </div>

          <div
            aria-label="Preview theme"
            className="flex shrink-0 rounded-[var(--radius-sm)] border border-border-default bg-surface p-[var(--space-half)]"
          >
            {(["light", "dark"] as const).map((option) => {
              const Icon = option === "light" ? Sun : Moon;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={theme === option}
                  onClick={() => setTheme(option)}
                  className={cn(
                    "type-label-l flex h-9 items-center gap-[var(--space-2)] rounded-[6px] px-[var(--space-3)] text-secondary outline-none focus-visible:shadow-[var(--focus-accent)]",
                    theme === option && "bg-surface-raised text-primary shadow-sm",
                  )}
                >
                  <Icon aria-hidden="true" size={16} />
                  <span className="hidden capitalize sm:inline">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[160px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border-default px-[var(--space-4)] py-[var(--space-8)] lg:block">
          <nav aria-label="Component sections" className="sticky top-[104px]">
            <p className="type-label-m mb-[var(--space-3)] text-muted">
              COMPONENTS
            </p>
            <ul className="space-y-[var(--space-half)]">
              {sections.map((section) => (
                <li key={section}>
                  <a
                    href={`#${sectionId(section)}`}
                    className="type-body-s block rounded-[var(--radius-xs)] px-[var(--space-2)] py-[6px] text-secondary hover:bg-surface-subtle hover:text-primary focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)]"
                  >
                    {section}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 px-[var(--space-6)] pb-[var(--space-16)] sm:px-[var(--space-10)] lg:px-[var(--space-8)]">
          <PreviewSection title="Button">
            <div className="space-y-[var(--space-8)]">
              {buttonSizes.map((size) => (
                <div key={size}>
                  <h3 className="type-label-l mb-[var(--space-4)] capitalize text-secondary">
                    {size}
                  </h3>
                  <div className="space-y-[var(--space-5)]">
                    {buttonVariants.map((variant) => (
                      <div
                        key={`${size}-${variant}`}
                        className="grid max-w-[484px] gap-[var(--space-5)] sm:grid-cols-3"
                      >
                        {buttonStates.map((state) => (
                          <div key={`${size}-${variant}-${state}`}>
                            <SpecimenLabel>
                              {variant} / {state}
                            </SpecimenLabel>
                            <Button
                              size={size}
                              variant={variant}
                              state={state}
                              className="w-[148px] max-w-full"
                            >
                              Button
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PreviewSection>

          <PreviewSection title="Form Field">
            <div className="grid gap-x-[var(--space-4)] gap-y-[var(--space-8)] md:grid-cols-2 xl:grid-cols-4">
              {fieldTypes.flatMap((type) =>
                fieldStates.map((state) => (
                  <div key={`${type}-${state}`}>
                    <SpecimenLabel>
                      {type} / {state}
                    </SpecimenLabel>
                    <FormField
                      type={type}
                      state={state}
                      label="Label"
                      value={type === "select" ? "input" : "Input value"}
                      helper="Helper text"
                      options={selectOptions}
                    />
                  </div>
                )),
              )}
            </div>
          </PreviewSection>

          <PreviewSection title="Status Badge">
            <div className="grid gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-5">
              {badgeTones.map((tone) => (
                <div key={tone} className="space-y-[var(--space-3)]">
                  <SpecimenLabel>{tone}</SpecimenLabel>
                  {badgeVariants.map((variant) => (
                    <StatusBadge
                      key={variant}
                      tone={tone}
                      variant={variant}
                      label="STATUS"
                    />
                  ))}
                </div>
              ))}
            </div>
          </PreviewSection>

          <PreviewSection title="Metric Card">
            <div className="grid gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
              {trends.map((trend) => (
                <div key={trend}>
                  <SpecimenLabel>{trend}</SpecimenLabel>
                  <MetricCard trend={trend} />
                </div>
              ))}
            </div>
          </PreviewSection>

          <PreviewSection title="Loading Skeleton">
            <div className="grid gap-[var(--space-4)]">
              <LoadingSkeleton variant="page" />
              <LoadingSkeleton variant="table" />
            </div>
          </PreviewSection>

          <PreviewSection title="Empty & Error">
            <div className="grid gap-[var(--space-4)]">
              <EmptyState
                title="Empty portfolio"
                description="No positions yet. Place a mock trade to begin."
                metadata="₫500M buying power"
                action={
                  <Button size="medium" variant="secondary" className="w-[148px]">
                    Explore Market
                  </Button>
                }
              />
              <ErrorState
                title="API error"
                description="The mock trade API rejected the request unexpectedly."
                metadata="TRACE MOCK-7F21"
                action={
                  <Button size="medium" variant="secondary" className="w-[148px]">
                    Try again
                  </Button>
                }
              />
            </div>
          </PreviewSection>
        </main>
      </div>
    </div>
  );
}
