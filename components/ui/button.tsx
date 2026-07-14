import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonState = "default" | "hover" | "disabled";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  state?: ButtonState;
}

const sizeClasses: Record<ButtonSize, string> = {
  small:
    "h-8 px-[var(--space-3)] text-[length:var(--font-size-12)] leading-[var(--line-18)] tracking-[0.2px]",
  medium:
    "h-10 px-[var(--space-4)] text-[length:var(--font-size-14)] leading-[var(--line-20)]",
  large:
    "h-12 px-[var(--space-5)] text-[length:var(--font-size-14)] leading-[var(--line-20)]",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-brand text-on-brand hover:bg-brand-hover [&[data-state=hover]]:bg-brand-hover disabled:border-transparent disabled:bg-disabled disabled:text-text-disabled",
  secondary:
    "border-border-default bg-surface-raised text-primary hover:border-border-strong hover:bg-surface-subtle [&[data-state=hover]]:border-border-strong [&[data-state=hover]]:bg-surface-subtle disabled:border-border-default disabled:bg-disabled disabled:text-text-disabled",
  danger:
    "border-transparent bg-loss text-on-danger hover:bg-loss [&[data-state=hover]]:bg-loss disabled:border-transparent disabled:bg-disabled disabled:text-text-disabled",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      size = "small",
      variant = "primary",
      state = "default",
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || state === "disabled";

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        data-size={size}
        data-style={variant}
        data-state={isDisabled ? "disabled" : state}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:shadow-[var(--focus-accent)] disabled:cursor-not-allowed disabled:pointer-events-none",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
