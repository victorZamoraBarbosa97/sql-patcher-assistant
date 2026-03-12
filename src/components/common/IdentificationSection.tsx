import React, { useState, useEffect } from "react";
import type { WizardData } from "../../types/wizard";
import {
  generateIdentificationQuery,
  PROJECT_IDS,
} from "../../utils/sqlGenerator";
import { TargetForm } from "../wizard/target/TargetForm";
import { SqlCanvas, SqlCanvasCopyButton } from "../ui/SqlCanvas";
import { useWizardStore } from "../../store/wizardStore";

const ReadOnlyField: React.FC<{
  label: string;
  value: string | null | undefined;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center bg-card border border-border px-3 py-2 rounded">
    <span className="text-[10px] text-text-secondary">{label}</span>
    <span className="text-xs font-mono text-text-main font-bold">
      {value || <span className="text-gray-500 font-normal">-</span>}
    </span>
  </div>
);

// Función pura de ayuda para el parseo (extraída para mejorar rendimiento y testabilidad)
const parseIdentificationContent = (
  content: string,
): Record<string, unknown> => {
  // 1. Intentar parsear como JSON
  try {
    let parsed = JSON.parse(content);
    if (Array.isArray(parsed)) parsed = parsed[0];
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // Ignorar error JSON y probar TSV
  }

  // 2. Intentar parsear como TSV (Excel)
  const rows = content.trim().split(/\r?\n/);
  if (rows.length >= 2) {
    const cleanCell = (cell: string) => cell.trim().replace(/^"|"$/g, "");
    const headers = rows[0].split("\t").map(cleanCell);
    const values = rows[1].split("\t").map(cleanCell);

    if (headers.length > 0 && values.length >= headers.length) {
      const parsed: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (header) parsed[header] = values[index];
      });
      return parsed;
    }
  }

  throw new Error(
    "Formato no reconocido. Pegue un JSON válido o una tabla Excel/TSV.",
  );
};

export interface IdentificationFields {
  ip: keyof WizardData;
  alias: keyof WizardData;
  project: keyof WizardData;
  identificationQuery: keyof WizardData;
  deviceId: keyof WizardData;
  interfaceId: keyof WizardData;
  statsId: keyof WizardData;
  deviceAlias: keyof WizardData;
  interfaceName: keyof WizardData;
  interfaceAlias: keyof WizardData;
}

interface IdentificationSectionProps {
  fields: IdentificationFields;
  isReady: boolean;
  title?: string;
  icon?: string;
  variant?: "target" | "source";
}

export const IdentificationSection: React.FC<IdentificationSectionProps> = ({
  fields,
  isReady,
  title,
  icon,
  variant = "target",
}) => {
  const data = useWizardStore((state) => state.data);
  const updateField = useWizardStore((state) => state.updateField);
  const [pasteContent, setPasteContent] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [showImageTooltip, setShowImageTooltip] = useState(false);

  const identificationQuery = data[fields.identificationQuery] as string | null;
  const extendedData = data as unknown as Record<
    string,
    string | null | undefined
  >;

  // Extraemos los valores específicos para usarlos como dependencias estables
  const currentIp = (data[fields.ip] as string) || "";
  const currentAlias = (data[fields.alias] as string) || "";
  const currentProject = (data[fields.project] as string) || "";

  const handleGenerateQuery = () => {
    const query = generateIdentificationQuery(
      (data[fields.ip] as string) || "",
      (data[fields.alias] as string) || "",
      (data[fields.project] as string) || "",
    );
    updateField(fields.identificationQuery, query);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!pasteContent.trim()) {
        setParseError(null);
        return;
      }

      try {
        const parsed = parseIdentificationContent(pasteContent);

        // Lógica de mapeo de campos
        const keys = Object.keys(parsed);
        const findKey = (target: string) =>
          keys.find((k) => k.toUpperCase() === target.toUpperCase());

        const deviceId = parsed[findKey("DEVICE_ID") || ""];
        const interfaceId = parsed[findKey("INTERFACE_ID") || ""];
        const statsId = parsed[findKey("STATSTABLEID") || ""];
        const deviceAlias = parsed[findKey("DEVICE_ALIAS") || ""];
        const interfaceName = parsed[findKey("INTERFACE_NAME") || ""];
        const interfaceAlias = parsed[findKey("ALIAS") || ""];

        // --- VALIDACIONES DE SEGURIDAD ---
        // 1. Validar IP
        const detectedIp = parsed[findKey("IP") || ""];
        if (
          detectedIp &&
          currentIp &&
          String(detectedIp).trim() !== currentIp.trim()
        ) {
          throw new Error(
            `Conflicto de IP: El resultado pertenece a ${detectedIp}, pero se buscó ${currentIp}.`,
          );
        }

        // 2. Validar Proyecto
        const detectedProject = parsed[findKey("PROJECT_ID") || ""];
        let inputProject = currentProject;

        // Normalizar: Si el usuario seleccionó un nombre (ej: PROYECTO_ALPHA), convertimos al ID esperado (ej: 1)
        if (PROJECT_IDS[inputProject]) {
          inputProject = String(PROJECT_IDS[inputProject]);
        }

        if (
          detectedProject &&
          inputProject &&
          String(detectedProject).trim() !== inputProject.trim()
        ) {
          throw new Error(
            `Conflicto de Proyecto: El resultado indica ID ${detectedProject}, pero se buscó ${currentProject} (ID ${inputProject}).`,
          );
        }

        // 3. Validar Interfaz (Búsqueda flexible)
        const nameMatch =
          interfaceName &&
          String(interfaceName)
            .toLowerCase()
            .includes(currentAlias.toLowerCase());
        const aliasMatch =
          interfaceAlias &&
          String(interfaceAlias)
            .toLowerCase()
            .includes(currentAlias.toLowerCase());

        if (currentAlias && !nameMatch && !aliasMatch) {
          throw new Error(
            `Conflicto de Interfaz: El término "${currentAlias}" no aparece en el nombre ni alias del resultado.`,
          );
        }
        // ---------------------------------

        if (!deviceId || !interfaceId || !statsId) {
          throw new Error(
            "Faltan campos requeridos (DEVICE_ID, INTERFACE_ID, STATSTABLEID).",
          );
        }

        updateField(fields.deviceId, String(deviceId));
        updateField(fields.interfaceId, String(interfaceId));
        updateField(fields.statsId, String(statsId));
        if (deviceAlias) updateField(fields.deviceAlias, String(deviceAlias));
        if (interfaceName)
          updateField(fields.interfaceName, String(interfaceName));
        if (interfaceAlias)
          updateField(fields.interfaceAlias, String(interfaceAlias));

        setParseError(null);
      } catch (e: unknown) {
        setParseError(e instanceof Error ? e.message : String(e));
      }
    }, 500); // Debounce de 500ms
    return () => clearTimeout(timer);
  }, [
    pasteContent,
    updateField,
    fields,
    currentIp,
    currentAlias,
    currentProject,
  ]);

  const handleInsertMockData = () => {
    const currentIp = (data[fields.ip] as string) || "192.168.1.10"; // IP genérica para demo
    const currentAlias = (data[fields.alias] as string) || "Enlace WAN";
    let currentProject = (data[fields.project] as string) || "1";

    // Usar el ID correcto en el mock para simular respuesta real de BD
    if (PROJECT_IDS[currentProject]) {
      currentProject = String(PROJECT_IDS[currentProject]);
    }

    // Generamos un TSV que coincida con lo que el usuario escribió para pasar la validación
    setPasteContent(
      `"PROJECT_ID"\t"DEVICE_ID"\t"DEVICE_ALIAS"\t"IP"\t"STATSTABLEID"\t"INTERFACE_ID"\t"INTERFACE_NAME"\t"ALIAS"\n"${currentProject}"\t"723"\t"ROUTER-CORE-01"\t"${currentIp}"\t"00212"\t"27167"\t"GigabitEthernet0/0/0"\t"${currentAlias}"`,
    );
  };

  const content = (
    <>
      <TargetForm
        onGenerate={handleGenerateQuery}
        ipField={fields.ip}
        aliasField={fields.alias}
        projectField={fields.project}
      />

      {identificationQuery && (
        <div className="mt-8 pt-8 border-t border-border animate-in fade-in slide-in-from-top-4 duration-500">
          <SqlCanvas
            stepIndicator="Query Generada"
            query={identificationQuery}
            autoHeight
            actionButtons={<SqlCanvasCopyButton text={identificationQuery} />}
          />

          <div className="mt-8">
            <div className="flex items-start space-x-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                <span className="material-icons text-blue-400">
                  integration_instructions
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
                    Instrucciones de Validación
                  </h3>
                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setShowImageTooltip(true)}
                    // onMouseLeave se maneja mejor si permitimos interacción en móvil
                  >
                    <span
                      className="material-icons text-sm text-text-secondary cursor-help hover:text-primary transition-colors"
                      onClick={() => setShowImageTooltip(!showImageTooltip)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        setShowImageTooltip(!showImageTooltip)
                      }
                      tabIndex={0}
                      role="button"
                      aria-label="Ver ejemplo de formato"
                    >
                      info
                    </span>
                    {showImageTooltip && (
                      <div
                        className="absolute left-0 top-6 md:left-full md:top-1/2 md:-translate-y-1/2 md:ml-2 z-50 w-72 md:w-96 bg-card border border-border rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200"
                        onMouseLeave={() => setShowImageTooltip(false)}
                      >
                        <img
                          src="/Excel_format_friendly.png"
                          alt="Formato Excel Friendly"
                          className="w-full h-auto rounded bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  1. Copie la query generada arriba y ejecútela en su gestor de
                  base de datos.
                  <br />
                  2. Copie el resultado (preferiblemente en formato Excel
                  Friendly o JSON) y péguelo en el recuadro de abajo.
                  <br />
                  3. Verifique que los IDs se hayan detectado correctamente.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                  Pegar Resultado
                </label>
                <button
                  onClick={handleInsertMockData}
                  className="text-[10px] font-medium text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center"
                  title="Insertar resultado de prueba para Portafolio"
                >
                  <span className="material-icons text-[10px] mr-1">
                    playlist_add
                  </span>
                  Insertar Datos de Prueba
                </button>
              </div>
              <textarea
                className={`w-full h-32 bg-input border ${parseError ? "border-red-500" : "border-border"} rounded-lg p-3 text-xs font-mono`}
                placeholder="Pegue aquí el resultado..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
              />
              {parseError && (
                <p className="text-red-500 text-[10px]">{parseError}</p>
              )}
            </div>

            <div className="space-y-4 bg-background/30 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-secondary uppercase">
                  Datos Detectados
                </span>
                {isReady && (
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                    Válido
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyField
                  label="Device ID"
                  value={extendedData[fields.deviceId]}
                />
                <ReadOnlyField
                  label="Interface ID"
                  value={extendedData[fields.interfaceId]}
                />
                <ReadOnlyField
                  label="Stats ID"
                  value={extendedData[fields.statsId]}
                />
                <ReadOnlyField
                  label="Device Alias"
                  value={extendedData[fields.deviceAlias]}
                />
                <ReadOnlyField
                  label="Interface Name"
                  value={extendedData[fields.interfaceName]}
                />
                <ReadOnlyField
                  label="Interface Alias"
                  value={extendedData[fields.interfaceAlias]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (title) {
    const isSource = variant === "source";
    const containerClasses = isSource
      ? "bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
      : "bg-card border border-border";
    const iconColor = isSource ? "text-blue-500" : "text-primary";

    return (
      <div
        className={`${containerClasses} rounded-xl p-6 animate-in fade-in slide-in-from-top-2`}
      >
        <div className="flex items-center space-x-2 mb-4">
          <span className={`material-icons ${iconColor}`}>
            {icon || "info"}
          </span>
          <h3 className="text-md font-bold text-text-main">{title}</h3>
        </div>
        {content}
      </div>
    );
  }

  return content;
};
