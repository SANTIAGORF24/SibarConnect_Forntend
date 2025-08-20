"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  helperText,
  error,
  className,
  size = "md"
}, ref) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-start space-x-3">
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-md border border-gray-300 ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-blue-600 data-[state=checked]:text-white",
          "data-[state=checked]:border-blue-600",
          "hover:data-[state=checked]:bg-blue-700",
          error && "border-red-500 focus-visible:ring-red-500",
          sizes[size],
          className
        )}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <CheckIcon className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <div className="grid gap-1.5 leading-none">
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-red-600"
            )}
          >
            {label}
          </label>
        )}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";
