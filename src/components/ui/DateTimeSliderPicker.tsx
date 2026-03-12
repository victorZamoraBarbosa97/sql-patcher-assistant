// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\ui\DateTimeSliderPicker.tsx
import React, { useState } from "react";
import { useWizardStore } from "../../store/wizardStore";
// import type { WizardData } from "../../types/wizard";

interface DateTimeSliderPickerProps {
  label: string;
  field: "startDate" | "endDate"; // Hace el campo específico para las fechas del wizard
  hasError?: boolean;
}

export const DateTimeSliderPicker: React.FC<DateTimeSliderPickerProps> = ({
  label,
  field,
  hasError,
}) => {
  const value = useWizardStore((state) => state.data[field]) as string | null;
  const updateField = useWizardStore((state) => state.updateField);

  // Usamos useState para fijar la fecha por defecto al montar el componente y evitar que cambie en cada render
  const [defaultDate] = useState(() => new Date());
  const dateObj = value ? new Date(value) : defaultDate;
  const validDate = !isNaN(dateObj.getTime()) ? dateObj : defaultDate;

  // Extraer partes en hora local
  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, "0");
  const day = String(validDate.getDate()).padStart(2, "0");
  const datePart = `${year}-${month}-${day}`;

  const hours = validDate.getHours();
  const minutes = validDate.getMinutes();

  const update = (dStr: string, h: number, m: number) => {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    updateField(field, `${dStr}T${hh}:${mm}`);
  };

  return (
    <div
      className={`p-4 bg-card border ${
        hasError ? "border-red-500" : "border-border"
      } rounded-lg space-y-4`}
    >
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
        <input
          type="date"
          className="bg-input border border-border rounded px-2 py-1 text-xs text-text-main focus:ring-primary focus:border-primary outline-none"
          value={datePart}
          onChange={(e) => update(e.target.value, hours, minutes)}
        />
      </div>

      <div className="space-y-3">
        {/* Hours */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-text-secondary w-8 uppercase">
            Hora
          </span>
          <input
            type="range"
            min="0"
            max="23"
            value={hours}
            onChange={(e) =>
              update(datePart, parseInt(e.target.value), minutes)
            }
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs font-mono w-6 text-right text-primary">
            {String(hours).padStart(2, "0")}
          </span>
        </div>

        {/* Minutes */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] text-text-secondary w-8 uppercase">
            Min
          </span>
          <input
            type="range"
            min="0"
            max="59"
            step="5"
            value={minutes}
            onChange={(e) => update(datePart, hours, parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs font-mono w-6 text-right text-primary">
            {String(minutes).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-border/30 mt-2">
        <span className="text-xs font-mono text-text-main opacity-80">
          {day}-{month}-{year}{" "}
          <span className="text-primary font-bold">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
          </span>
        </span>
      </div>
    </div>
  );
};
