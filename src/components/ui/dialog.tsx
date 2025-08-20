import { Dialog as RadixDialog, DialogProps as RadixDialogProps } from "@radix-ui/themes";
import { ReactNode } from "react";

// Extendemos las props del dialog de Radix UI
export interface DialogProps extends RadixDialogProps {
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export interface DialogContentProps {
    children: ReactNode;
    size?: "1" | "2" | "3" | "4";
    className?: string;
}

export interface DialogTitleProps {
    children: ReactNode;
    className?: string;
}

export interface DialogDescriptionProps {
    children: ReactNode;
    className?: string;
}

// Componente Dialog principal
export function Dialog({ children, ...props }: DialogProps) {
    return <RadixDialog {...props}>{children}</RadixDialog>;
}

// Componente Dialog.Root
export function DialogRoot({ children, ...props }: DialogProps) {
    return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
}

// Componente Dialog.Trigger
export function DialogTrigger({ children, ...props }: { children: ReactNode }) {
    return <RadixDialog.Trigger {...props}>{children}</RadixDialog.Trigger>;
}

// Componente Dialog.Content
export function DialogContent({ children, size = "2", className = "", ...props }: DialogContentProps) {
    return (
        <RadixDialog.Content size={size} className={className} {...props}>
            {children}
        </RadixDialog.Content>
    );
}

// Componente Dialog.Title
export function DialogTitle({ children, className = "", ...props }: DialogTitleProps) {
    return (
        <RadixDialog.Title className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
            {children}
        </RadixDialog.Title>
    );
}

// Componente Dialog.Description
export function DialogDescription({ children, className = "", ...props }: DialogDescriptionProps) {
    return (
        <RadixDialog.Description className={`text-gray-600 ${className}`} {...props}>
            {children}
        </RadixDialog.Description>
    );
}

// Componente Dialog.Close
export function DialogClose({ children, ...props }: { children: ReactNode }) {
    return <RadixDialog.Close {...props}>{children}</RadixDialog.Close>;
}
