// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\SqlCanvasCopyButton.tsx
import React, { useState } from "react";

export const SqlCanvasCopyButton: React.FC<{
  text: string;
  label?: string;
  className?: string;
}> = ({ text, label, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        relative flex items-center justify-center transition-all duration-200 group
        ${label ? "px-3 py-1.5 rounded-md border" : "p-1.5 rounded-md"}
        ${
          copied
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20"
        }
        ${className}
      `}
      title="Copiar al portapapeles"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <span
          className={`material-icons text-xs absolute transition-all duration-300 transform ${
            copied
              ? "opacity-0 scale-50 rotate-45"
              : "opacity-100 scale-100 rotate-0"
          }`}
        >
          content_copy
        </span>
        <span
          className={`material-icons text-xs absolute transition-all duration-300 transform ${
            copied
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-50 -rotate-45"
          }`}
        >
          check
        </span>
      </div>

      {label && (
        <span className="ml-2 text-xs font-medium">
          {copied ? "Copiado" : label}
        </span>
      )}
    </button>
  );
};
