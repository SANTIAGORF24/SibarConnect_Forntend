"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    label,
    error,
    helperText,
    disabled = false,
    className,
    size = "md"
  }, ref) => {
    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-4 text-base",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-gray-400",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              sizes[size],
              className
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className="relative z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                      "focus:bg-gray-100 focus:text-gray-900",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      option.disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <CheckIcon className="h-4 w-4" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

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

Select.displayName = "Select";
