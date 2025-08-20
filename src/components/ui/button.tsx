import { Button as RadixButton, ButtonProps as RadixButtonProps } from "@radix-ui/themes";
import { ReactNode } from "react";

// Extendemos las props del botón de Radix UI
export interface ButtonProps extends RadixButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

// Variantes de botones predefinidas
const buttonVariants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-lg",
    outline: "bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg"
};

// Tamaños predefinidos
const buttonSizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}: ButtonProps) {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105";

    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];

    return (
        <RadixButton
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
            {...props}
        >
            {children}
        </RadixButton>
    );
}

// Botones especializados para casos de uso comunes
export function PrimaryButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
    return <Button variant="primary" {...props}>{children}</Button>;
}

export function SecondaryButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
    return <Button variant="secondary" {...props}>{children}</Button>;
}

export function OutlineButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
    return <Button variant="outline" {...props}>{children}</Button>;
}

export function GhostButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
    return <Button variant="ghost" {...props}>{children}</Button>;
}

export function DangerButton({ children, ...props }: Omit<ButtonProps, 'variant'>) {
    return <Button variant="danger" {...props}>{children}</Button>;
}
