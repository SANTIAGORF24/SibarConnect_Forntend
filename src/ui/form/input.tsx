"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = "default",
    size = "md",
    ...props
  }, ref) => {
    const variants = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      filled: "border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white",
      outlined: "border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-4 py-3 text-base",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "block w-full rounded-lg border transition-all duration-200",
              "placeholder:text-gray-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              variants[variant],
              sizes[size],
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";


