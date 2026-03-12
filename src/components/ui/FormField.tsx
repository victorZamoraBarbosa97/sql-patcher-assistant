// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\ui\FormField.tsx
import React from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-text-secondary">
        {label}
      </label>
      <input
        type={type}
        className="block w-full px-2 py-1.5 bg-input border border-border rounded text-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};
