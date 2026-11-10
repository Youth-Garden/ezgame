import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      errorMessage,
      rightElement,
      className = "",
      containerClassName = "",
      type = "text",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const inputNode = (
      <div className="relative w-full flex items-center">
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground text-xs outline-none border-none focus:ring-1.5 focus:ring-primary transition-all",
            rightElement && "pr-10",
            error && "focus:ring-destructive text-destructive",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    );

    if (!label && !errorMessage) {
      return inputNode;
    }

    return (
      <div className={cn("w-full flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-foreground tracking-tight select-none"
          >
            {label}
          </label>
        )}
        {inputNode}
        {errorMessage && (
          <span className="text-[11px] text-destructive font-medium">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
