import React from "react";
import { useWizardStore } from "../../../store/wizardStore";

export const ModeSelector: React.FC = () => {
  const patchType = useWizardStore((state) => state.data.patchType);
  const updateField = useWizardStore((state) => state.updateField);

  return (
    <div className="mb-8">
      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">
        Modo de Operación
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => updateField("patchType", "timeShift")}
          className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            patchType === "timeShift"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border bg-card hover:border-primary/50 hover:bg-background/50"
          }`}
        >
          <div
            className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors ${
              patchType === "timeShift"
                ? "bg-primary text-white"
                : "bg-background border border-border text-text-secondary"
            }`}
          >
            <span className="material-icons">build</span>
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold text-sm ${patchType === "timeShift" ? "text-primary" : "text-text-main"}`}
            >
              Duplicar
            </h3>
            <p className="text-xs text-text-secondary">
              Datos Desde Misma Interfaz
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${patchType === "timeShift" ? "border-primary" : "border-text-secondary/30"}`}
          >
            {patchType === "timeShift" && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
        </div>

        <div
          onClick={() => updateField("patchType", "cloning")}
          className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            patchType === "cloning"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border bg-card hover:border-primary/50 hover:bg-background/50"
          }`}
        >
          <div
            className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-colors ${
              patchType === "cloning"
                ? "bg-primary text-white"
                : "bg-background border border-border text-text-secondary"
            }`}
          >
            <span className="material-icons">content_copy</span>
          </div>
          <div className="flex-1">
            <h3
              className={`font-bold text-sm ${patchType === "cloning" ? "text-primary" : "text-text-main"}`}
            >
              Clonación
            </h3>
            <p className="text-xs text-text-secondary">
              Desde Otra Interfaz Diferente
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${patchType === "cloning" ? "border-primary" : "border-text-secondary/30"}`}
          >
            {patchType === "cloning" && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
