import { PropsWithChildren } from "react";

export type CardProps = PropsWithChildren<{ 
  title?: string; 
  subtitle?: string; 
  className?: string;
  variant?: "default" | "glass" | "elevated";
}>;

export function Card({ title, subtitle, className, variant = "default", children }: CardProps) {
  const variants = {
    default: "rounded-2xl border border-gray-200 bg-white shadow-sm",
    glass: "rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-xl",
    elevated: "rounded-2xl border-0 bg-white shadow-2xl shadow-black/10"
  };

  return (
    <div className={`${variants[variant]} ${className || ""}`}>
      {(title || subtitle) && (
        <div className="p-4 lg:p-6 border-b border-gray-100">
          {title ? <h3 className="text-lg font-semibold text-foreground">{title}</h3> : null}
          {subtitle ? <p className="text-sm text-foreground/70 mt-1">{subtitle}</p> : null}
        </div>
      )}
      <div className="p-6 lg:p-8">{children}</div>
    </div>
  );
}


