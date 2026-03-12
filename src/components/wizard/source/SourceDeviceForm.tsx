// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\source\SourceDeviceForm.tsx
import React from "react";
import { SqlCanvas } from "../../ui/SqlCanvas";
import type { WizardData } from "../../../types/wizard";
import { generateIdentificationQuery } from "../../../utils/sqlGenerator";
import { FormField } from "../../ui/FormField";

interface SourceDeviceFormProps {
  data: WizardData;
  onUpdate: (field: keyof WizardData, value: string | null) => void;
}

export const SourceDeviceForm: React.FC<SourceDeviceFormProps> = ({
  data,
  onUpdate,
}) => {
  // Generar query de identificación para el SOURCE
  const handleGenerateSourceIdQuery = () => {
    if (data.sourceIp && data.sourceAlias) {
      const query = generateIdentificationQuery(
        data.sourceIp,
        data.sourceAlias,
        data.project,
      );
      onUpdate("sourceIdentificationQuery", query);
    }
  };

  return (
    <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800">
      <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3">
        Datos del Donante (Source)
      </h4>

      {/* Mini formulario para identificar Source */}
      <div className="mb-4 pb-4 border-b border-border/50">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="px-2 py-1 bg-input border border-border rounded text-xs"
            placeholder="IP Donante"
            value={data.sourceIp || ""}
            onChange={(e) => onUpdate("sourceIp", e.target.value)}
          />
          <input
            className="px-2 py-1 bg-input border border-border rounded text-xs"
            placeholder="Alias Donante"
            value={data.sourceAlias || ""}
            onChange={(e) => onUpdate("sourceAlias", e.target.value)}
          />
        </div>
        <button
          onClick={handleGenerateSourceIdQuery}
          className="w-full py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold rounded hover:bg-orange-200 transition-colors"
        >
          Generar Query ID Donante
        </button>
        {data.sourceIdentificationQuery && (
          <div className="mt-2 h-24">
            <SqlCanvas
              query={data.sourceIdentificationQuery}
              stepIndicator="ID Donante"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <FormField
          label="Stats ID"
          value={data.sourceStatsId || ""}
          onChange={(e) => onUpdate("sourceStatsId", e.target.value)}
        />
        <FormField
          label="Int. ID"
          value={data.sourceInterfaceId || ""}
          onChange={(e) => onUpdate("sourceInterfaceId", e.target.value)}
        />
        <FormField
          label="Dev. ID"
          value={data.sourceDeviceId || ""}
          onChange={(e) => onUpdate("sourceDeviceId", e.target.value)}
        />
      </div>
    </div>
  );
};
