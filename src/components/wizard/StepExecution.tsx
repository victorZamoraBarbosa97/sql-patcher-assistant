// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\StepExecution.tsx
import React, { useState, useEffect } from "react";
import { SqlCanvas, SqlCanvasCopyButton } from "../ui/SqlCanvas";
import { Modal } from "../ui/Modal";
import type { WizardData } from "../../types/wizard";
import {
  generateFinalInjectionQuery,
  generateRollbackQuery,
} from "../../utils/sqlGenerator";
import {
  fetchSisproChartData,
  extractSiteId,
  type ChartDataPoint,
} from "../../utils/sisproApi";
import { BandwidthChartModal } from "./BandwidthChartModal";
import { useWizardStore } from "../../store/wizardStore";
import { parseDate } from "../../utils/dateUtils";
import {
  logInjection,
  type InjectionLog,
} from "../../services/injectionLogService";

interface WizardDataWithInterface extends WizardData {
  interfaceName?: string;
  interfaceAlias?: string;
}

export const StepExecution: React.FC = () => {
  const data = useWizardStore((state) => state.data);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);
  const [viewMode, setViewMode] = useState<"injection" | "rollback">(
    "injection",
  );
  const [isLogging, setIsLogging] = useState(false);

  const extendedData = data as WizardDataWithInterface;

  const injectionQuery = generateFinalInjectionQuery(data);
  const rollbackQuery = generateRollbackQuery(data);

  const displayQuery =
    viewMode === "injection" ? injectionQuery : rollbackQuery;

  const [previewData, setPreviewData] = useState<
    { ts: string; in: string; out: string }[]
  >([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  // Cargar datos de previsualización con Time Shift
  useEffect(() => {
    const loadPreview = async () => {
      if (
        !data.startDate ||
        !data.endDate ||
        !data.targetDeviceId ||
        !data.interfaceId
      )
        return;

      setIsLoadingPreview(true);
      try {
        const startGap = parseDate(data.startDate);
        const endGap = parseDate(data.endDate);
        const durationMs = endGap.getTime() - startGap.getTime();

        // 1. Calcular el rango FUENTE (de donde copiamos los datos)
        let startSource: Date;
        let endSource: Date;

        // Buffer de seguridad (15 min) para evitar tomar datos del borde de la falla (que suelen ser 0)
        const safetyBuffer = 15 * 60 * 1000;

        if (data.fillMode === "next") {
          // Usar datos futuros: Empezamos después del hueco + buffer
          startSource = new Date(endGap.getTime() + safetyBuffer);
          endSource = new Date(startSource.getTime() + durationMs);
        } else {
          // Usar datos pasados (default): Terminamos antes del hueco - buffer
          endSource = new Date(startGap.getTime() - safetyBuffer);
          startSource = new Date(endSource.getTime() - durationMs);
        }

        // Formato DD-MM-YYYY HH:mm para la API
        const formatDate = (d: Date) => {
          const pad = (n: number) => n.toString().padStart(2, "0");
          return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const siteId = extractSiteId(data.targetDeviceAlias || "") || "";

        // 2. Consultar API
        const response = await fetchSisproChartData({
          equipo: data.targetDeviceId,
          interfaceId: data.interfaceId,
          sitio: siteId,
          ref: siteId,
          startDate: formatDate(startSource),
          endDate: formatDate(endSource),
        });

        // 3. Aplicar Desfase de Tiempo (Time Shift) a los resultados
        // Calculamos la diferencia para proyectar el tiempo fuente al tiempo del hueco
        const timeShift = startGap.getTime() - startSource.getTime();

        const mapped = response
          .map((item: ChartDataPoint) => {
            const sourceTime = parseDate(item.Fecha).getTime();
            const targetTime = sourceTime + timeShift; // Ajuste mágico

            // Filtrar datos que caigan fuera del rango del hueco seleccionado
            // Esto evita que aparezcan registros más allá de la fecha final si la API devuelve un buffer
            if (
              targetTime < startGap.getTime() ||
              targetTime > endGap.getTime()
            ) {
              return null;
            }

            const d = new Date(targetTime);

            const pad = (n: number) => n.toString().padStart(2, "0");
            const tsStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

            return {
              ts: tsStr,
              in: item.Entrada
                ? Number(item.Entrada).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })
                : "0",
              out: item.Salida
                ? Number(item.Salida).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })
                : "0",
            };
          })
          .filter(
            (item): item is { ts: string; in: string; out: string } =>
              item !== null,
          );

        setPreviewData(mapped);
      } catch (error) {
        console.error("Error cargando preview:", error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    loadPreview();
  }, [
    data.startDate,
    data.endDate,
    data.fillMode,
    data.targetDeviceId,
    data.interfaceId,
    data.targetDeviceAlias,
  ]);

  const handleLogAndCopy = async () => {
    if (isLogging) return;
    setIsLogging(true);

    try {
      const logData: Omit<InjectionLog, "id" | "createdAt"> = {
        patchType: data.patchType,
        target: {
          ip: data.ip,
          alias: data.alias,
          deviceId: data.targetDeviceId || null,
          interfaceId: data.interfaceId || null,
          statsId: data.statsId || null,
          interfaceName: extendedData.interfaceName,
        },
        source:
          data.patchType === "cloning"
            ? {
                ip: data.sourceIp || null,
                alias: data.sourceAlias || null,
                deviceId: data.sourceDeviceId || null,
                interfaceId: data.sourceInterfaceId || null,
                statsId: data.sourceStatsId || null,
              }
            : null,
        dateRange: {
          start: data.startDate || null,
          end: data.endDate || null,
        },
        fillMode: data.fillMode,
        injectionQuery,
        rollbackQuery,
      };

      await logInjection(logData);
      navigator.clipboard.writeText(injectionQuery);

      setModalConfig({
        isOpen: true,
        title: "Éxito",
        message:
          "La operación ha sido registrada en Firebase y la consulta SQL ha sido copiada al portapapeles.",
        type: "success",
      });
    } catch (error) {
      console.error("Error logging to Firebase:", error);
      setModalConfig({
        isOpen: true,
        title: "Error de Registro",
        message: `No se pudo guardar el registro en Firebase. La consulta NO ha sido copiada. Revisa la consola para más detalles.`,
        type: "error",
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        type={modalConfig.type}
      >
        {modalConfig.message}
      </Modal>

      <div className="bg-card shadow-2xl rounded-xl border border-border overflow-hidden transition-colors duration-200">
        <div className="flex flex-col lg:flex-row h-150 border-b border-border">
          {/* Left Side: Chart */}
          <div className="flex-1 border-r border-border p-2 relative overflow-hidden">
            <BandwidthChartModal
              isOpen={true}
              onClose={() => {}}
              inline={true}
              className="h-full"
              initialData={{
                deviceId: data.targetDeviceId || "",
                interfaceId: data.interfaceId || "",
                deviceAlias: data.targetDeviceAlias || undefined,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
              }}
            />
          </div>

          {/* Right Side: Table Preview */}
          <div className="w-full lg:w-96 bg-background/30 flex flex-col">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Table Preview
              </h3>
              <span className="text-[10px] text-text-secondary font-mono">
                TEMP_BUFFER_TABLE ({previewData.length} registros)
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full font-mono text-[11px] text-text-secondary">
                <thead>
                  <tr className="bg-background border-b border-border">
                    <th className="px-4 py-2 text-left font-semibold text-text-secondary">
                      TIMESTAMP
                    </th>
                    <th className="px-4 py-2 text-right font-semibold text-text-secondary">
                      IN
                    </th>
                    <th className="px-4 py-2 text-right font-semibold text-text-secondary">
                      OUT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingPreview ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-xs text-text-secondary"
                      >
                        <span className="material-icons animate-spin text-lg mb-2">
                          refresh
                        </span>
                        <br />
                        Cargando datos y aplicando Time Shift...
                      </td>
                    </tr>
                  ) : (
                    previewData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-blue-300">
                          {row.ts}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {row.in}
                        </td>
                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          {row.out}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border bg-background/50">
              <div className="flex items-center text-yellow-500/80 mb-2">
                <span className="material-icons text-xs mr-1">warning</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Modo Previsualización
                </span>
              </div>
              <p className="text-[10px] text-text-secondary leading-tight">
                Los datos mostrados son una proyección de la fuente (
                {data.fillMode === "next" ? "Futuro" : "Pasado"}) ajustados al
                horario del hueco. antes de la inyección final.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background/50 px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm">
              <span className="text-text-secondary mr-2">Destino:</span>
              <span className="font-mono text-blue-400">
                {data.ip} - {data.targetDeviceAlias}
              </span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center text-sm">
              <span className="text-text-secondary mr-2">Interfaz:</span>
              <span className="font-mono text-blue-400">
                {extendedData.interfaceName || data.alias}{" "}
                {extendedData.interfaceAlias
                  ? `(${extendedData.interfaceAlias})`
                  : ""}
              </span>
            </div>
          </div>
          {/* Toggle View Mode */}
          <div className="flex bg-input/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setViewMode("injection")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "injection"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Inyección SQL
            </button>
            <button
              onClick={() => setViewMode("rollback")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                viewMode === "rollback"
                  ? "bg-red-500/80 hover:bg-red-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Rollback SQL
            </button>
          </div>
          <div className="flex space-x-3">
            <SqlCanvasCopyButton
              text={displayQuery}
              label="Copy All"
              className="bg-background border-border hover:bg-background/80"
            />
            <button
              onClick={handleLogAndCopy}
              disabled={isLogging || viewMode !== "injection"}
              title={
                viewMode !== "injection"
                  ? "Solo se puede guardar la consulta de Inyección"
                  : "Guardar registro y copiar SQL"
              }
              className="flex items-center px-4 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLogging ? (
                <span className="material-icons animate-spin text-sm mr-1.5">
                  sync
                </span>
              ) : (
                <span className="material-icons text-sm mr-1.5">save</span>
              )}
              {isLogging ? "Guardando..." : "Guardar y Copiar"}
            </button>
          </div>
        </div>

        {/* Bottom: SQL Canvas */}
        <div className="h-150 w-full">
          <SqlCanvas
            title="SQL Canvas"
            stepIndicator="Query 3 de 3"
            className="rounded-none border-0 h-full"
            query={displayQuery}
          >
            {/* Fallback content if needed */}
          </SqlCanvas>
        </div>

        <div className="bg-background/30 px-8 py-6 flex items-center justify-between border-t border-border">
          <button
            onClick={() => setCurrentStep(2)}
            className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-main transition-colors"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Atrás
          </button>
        </div>
      </div>
    </>
  );
};
