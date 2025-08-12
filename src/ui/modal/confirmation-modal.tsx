"use client";
import { Modal } from "../modal/modal";
import { Button } from "../button/button";

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "danger":
        return "primary"; // You might want to create a "danger" variant
      case "warning":
        return "secondary";
      case "info":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {getIcon()}
        <p className="text-foreground/80 mb-6 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
            className={`order-1 sm:order-2 ${
              type === "danger" 
                ? "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600" 
                : ""
            }`}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
