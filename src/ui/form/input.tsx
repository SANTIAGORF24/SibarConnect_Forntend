"use client";
import { InputHTMLAttributes, forwardRef } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ label, error, leftIcon, rightIcon, helperText, className, id, ...props }, ref) {
    const inputId = id || props.name || undefined;
    
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-semibold text-foreground/80 mb-2">
            {label}
          </label>
        ) : null}
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 bg-white shadow-sm ${
            error 
              ? "border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20" 
              : "border-gray-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 hover:border-gray-300"
          } ${className || ""}`}
        >
          {leftIcon ? (
            <span className="pl-4 text-foreground/60 flex items-center">{leftIcon}</span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/50 ${
              leftIcon ? "pl-3" : "pl-4"
            } ${
              rightIcon ? "pr-3" : "pr-4"
            } py-3.5`}
            {...props}
          />
          {rightIcon ? (
            <span className="pr-4 text-foreground/60 flex items-center">{rightIcon}</span>
          ) : null}
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


