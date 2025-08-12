"use client";
import { forwardRef, InputHTMLAttributes } from "react";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref
) {
  const inputId = id || props.name || undefined;
  return (
    <label htmlFor={inputId} className={`inline-flex items-center gap-3 text-sm text-foreground/80 select-none cursor-pointer group ${className || ""}`}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="h-5 w-5 rounded-lg border-2 border-gray-300 text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:outline-none transition-all duration-200 cursor-pointer checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] group-hover:border-[var(--color-primary)]/60"
          {...props}
        />
        {props.checked && (
          <svg 
            className="absolute inset-0 w-5 h-5 text-white pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {label ? <span className="font-medium group-hover:text-foreground transition-colors">{label}</span> : null}
    </label>
  );
});
