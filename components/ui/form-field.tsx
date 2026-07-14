import {
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type FormFieldType = "text" | "search" | "select";
export type FormFieldState = "default" | "focus" | "error" | "disabled";

type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type" | "disabled" | "aria-invalid" | "aria-describedby"
>;

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "disabled" | "aria-invalid" | "aria-describedby"
>;

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  id?: string;
  label: string;
  value?: string;
  helper?: string;
  type?: FormFieldType;
  state?: FormFieldState;
  disabled?: boolean;
  name?: string;
  options?: FormFieldOption[];
  inputProps?: InputProps;
  selectProps?: SelectProps;
}

const controlStateClasses: Record<FormFieldState, string> = {
  default:
    "border-border-default bg-canvas text-secondary focus-within:border-border-focus focus-within:text-primary focus-within:shadow-[var(--focus-accent)]",
  focus:
    "border-border-focus bg-canvas text-primary shadow-[var(--focus-accent)]",
  error:
    "border-border-error bg-canvas text-primary focus-within:border-border-error focus-within:shadow-[0_0_0_3px_rgb(239_68_68_/_20%)]",
  disabled: "border-border-default bg-disabled text-text-disabled",
};

export function FormField({
  id,
  className,
  label,
  value,
  helper,
  type = "text",
  state = "default",
  disabled,
  name,
  options = [],
  inputProps,
  selectProps,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? `field-${generatedId}`;
  const helperId = helper ? `${controlId}-helper` : undefined;
  const isDisabled = disabled || state === "disabled";
  const isError = state === "error";

  const {
    value: inputValue,
    defaultValue: inputDefaultValue,
    className: inputClassName,
    ...restInputProps
  } = inputProps ?? {};
  const {
    value: selectValue,
    defaultValue: selectDefaultValue,
    className: selectClassName,
    ...restSelectProps
  } = selectProps ?? {};

  const describedBy = helperId;
  const commonControlProps = {
    id: controlId,
    name,
    disabled: isDisabled,
    "aria-invalid": isError || undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div
      data-type={type}
      data-state={isDisabled ? "disabled" : state}
      className={cn(
        "flex w-[290px] max-w-full flex-col gap-[6px]",
        className,
      )}
      {...props}
    >
      <label
        htmlFor={controlId}
        className={cn(
          "type-label-m",
          isDisabled ? "text-text-disabled" : "text-muted",
        )}
      >
        {label}
      </label>

      <div
        className={cn(
          "flex h-11 w-full items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border px-[var(--space-3)] transition-[border-color,box-shadow,color]",
          controlStateClasses[isDisabled ? "disabled" : state],
        )}
      >
        {type === "search" ? (
          <Search
            aria-hidden="true"
            size={14}
            strokeWidth={2}
            className={cn(
              "shrink-0",
              isDisabled ? "text-text-disabled" : "text-muted",
            )}
          />
        ) : null}

        {type === "select" ? (
          <div className="relative flex min-w-0 flex-1 items-center">
            <select
              {...commonControlProps}
              {...(selectValue !== undefined
                ? { value: selectValue }
                : { defaultValue: selectDefaultValue ?? value })}
              className={cn(
                "type-body-m min-w-0 flex-1 appearance-none bg-transparent pr-[var(--space-6)] text-current outline-none disabled:cursor-not-allowed",
                selectClassName,
              )}
              {...restSelectProps}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              size={14}
              strokeWidth={2}
              className="pointer-events-none absolute right-0 text-muted"
            />
          </div>
        ) : (
          <input
            {...commonControlProps}
            type={type}
            {...(inputValue !== undefined
              ? { value: inputValue }
              : { defaultValue: inputDefaultValue ?? value })}
            className={cn(
              "type-body-m min-w-0 flex-1 bg-transparent text-current outline-none placeholder:text-muted disabled:cursor-not-allowed",
              inputClassName,
            )}
            {...restInputProps}
          />
        )}
      </div>

      {helper ? (
        <p
          id={helperId}
          className={cn(
            "type-body-s",
            isDisabled
              ? "text-text-disabled"
              : isError
                ? "text-loss"
                : "text-muted",
          )}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}
