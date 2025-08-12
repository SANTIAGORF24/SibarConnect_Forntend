"use client";
import { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({ variant = "primary", fullWidth, className, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none h-10 px-4";
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--color-primary)] text-white hover:brightness-110 focus-visible:ring-[var(--color-primary)] ring-offset-background",
    secondary:
      "bg-[var(--color-secondary)] text-white hover:brightness-110 focus-visible:ring-[var(--color-secondary)] ring-offset-background",
    ghost:
      "bg-transparent text-foreground hover:bg-foreground/5 border border-black/10 dark:border-white/15",
  };
  const width = fullWidth ? "w-full" : "";
  const composed = `${base} ${variants[variant]} ${width} ${className || ""}`;
  return <button className={composed} {...props} />;
}


