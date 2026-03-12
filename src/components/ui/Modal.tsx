import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: "success" | "error" | "info" | "warning";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = "info",
}) => {
  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const iconStyles = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center space-x-3">
            <span className={`material-icons ${typeStyles[type]}`}>
              {iconStyles[type]}
            </span>
            <h3 className="font-bold text-text-main text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-main transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="p-6 text-text-secondary text-sm leading-relaxed whitespace-pre-line">
          {children}
        </div>
        <div className="px-6 py-4 bg-background/30 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
