"use client";

import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: "default" | "filled" | "outlined";
    size?: "sm" | "md" | "lg";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        className,
        label,
        error,
        helperText,
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

                <textarea
                    className={cn(
                        "block w-full rounded-lg border transition-all duration-200",
                        "placeholder:text-gray-400",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "focus:outline-none focus:ring-2 focus:ring-offset-0",
                        "resize-vertical",
                        variants[variant],
                        sizes[size],
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />

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

Textarea.displayName = "Textarea";
