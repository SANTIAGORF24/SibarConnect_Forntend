"use client";
import { SelectHTMLAttributes, forwardRef } from "react";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, helperText, options, placeholder, className, id, ...props }, ref) {
    const inputId = id || props.name || undefined;
    
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-semibold text-foreground/80 mb-2">
            {label}
          </label>
        ) : null}
        <div
          className={`relative rounded-xl border transition-all duration-200 bg-white shadow-sm ${
            error 
              ? "border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20" 
              : "border-gray-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 hover:border-gray-300"
          } ${className || ""}`}
        >
          <select
            ref={ref}
            id={inputId}
            className="w-full bg-transparent outline-none text-sm text-foreground px-4 py-3.5 appearance-none cursor-pointer"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="w-4 h-4 text-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="mt-2 text-xs text-red-600 flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-2 text-xs text-foreground/60">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
