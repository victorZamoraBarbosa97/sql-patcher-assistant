// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\StepSource.tsx

import React, { useEffect, useRef, useState, useMemo } from "react";
import { SqlCanvas, SqlCanvasCopyButton } from "../ui/SqlCanvas";
import { DeviceInfoCard } from "../ui/DeviceInfoCard";
import type { WizardData } from "../../types/wizard";
import { generateTimeShiftQuery } from "../../utils/sqlGenerator";
import { BandwidthChartModal } from "./BandwidthChartModal";
import { DateTimeSliderPicker } from "../ui/DateTimeSliderPicker";
import { IdentificationSection } from "../common/IdentificationSection";
import { useWizardStore } from "../../store/wizardStore";
import type { IdentificationFields } from "../common/IdentificationSection";
import { parseDate } from "../../utils/dateUtils";

export const StepSource: React.FC = () => {
  const data = useWizardStore((state) => state.data);
  const updateField = useWizardStore((state) => state.updateField);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);

  const isCloning = data.patchType === "cloning";
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const dateError = useMemo(() => {
    if (!data.startDate || !data.endDate) return null;
    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);
    const now = new Date();

    if (start >= end) {
      return "La fecha de fin debe ser posterior a la fecha de inicio.";
    }
    if (start > now || end > now) {
      return "No puedes seleccionar fechas futuras.";
    }
    return null;
  }, [data.startDate, data.endDate]);

  // Calcular registros estimados (Intervalo de 5 min)
  const estimatedRecords = useMemo(() => {
    if (!data.startDate || !data.endDate) return null;
    const start = parseDate(data.startDate);
    const end = parseDate(data.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      return null;

    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return Math.floor(diffMinutes / 5);
  }, [data.startDate, data.endDate]);

  // Efecto para regenerar la query principal
  useEffect(() => {
    const hasTargetIds = !!(data.statsId && data.interfaceId);
    const hasSourceIds = isCloning
      ? !!(
          data.sourceStatsId &&
          data.sourceInterfaceId &&
          data.sourceDeviceId &&
          data.targetDeviceId
        )
      : true;
    const hasDates = !!(data.startDate && data.endDate && !dateError);

    if (hasTargetIds && hasSourceIds && hasDates) {
      // Ajuste para incluir el último intervalo (la fecha de fin seleccionada)
      // Si el usuario selecciona 10:25, queremos que se incluya en la generación.
      const queryData = { ...data };
      if (queryData.endDate) {
        const endDateObj = parseDate(queryData.endDate);
        if (!isNaN(endDateObj.getTime())) {
          endDateObj.setMinutes(endDateObj.getMinutes() + 5);
          const year = endDateObj.getFullYear();
          const month = String(endDateObj.getMonth() + 1).padStart(2, "0");
          const day = String(endDateObj.getDate()).padStart(2, "0");
          const hours = String(endDateObj.getHours()).padStart(2, "0");
          const minutes = String(endDateObj.getMinutes()).padStart(2, "0");
          queryData.endDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        }
      }

      const query = generateTimeShiftQuery(queryData);
      if (data.timeShiftQuery !== query) {
        updateField("timeShiftQuery", query);
      }
    }
  }, [data, updateField, isCloning, dateError]);

  // Construcción de la consulta acumulativa con títulos descriptivos
  const step1Title = "-- PASO 1: IDENTIFICACIÓN DE DISPOSITIVO";
  const step2Title = isCloning
    ? "-- PASO 2: CLONACIÓN DE INTERFAZ"
    : "-- PASO 2: REPARACIÓN (TIME SHIFT)";

  const cumulativeQuery = [
    data.identificationQuery
      ? `${step1Title}\n${data.identificationQuery}`
      : null,
    data.timeShiftQuery ? `\n\n${step2Title}\n${data.timeShiftQuery}` : null,
  ]
    .filter(Boolean)
    .join("");

  // Auto-scroll hacia el final cuando cambia la consulta
  useEffect(() => {
    if (canvasContainerRef.current) {
      const scrollable = canvasContainerRef.current.querySelector(
        "textarea, pre, code, .overflow-auto, .overflow-y-auto",
      );
      if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
      }
    }
  }, [cumulativeQuery]);

  const isSourceReady = !!(
    data.sourceDeviceId &&
    data.sourceInterfaceId &&
    data.sourceStatsId
  );

  const sourceFields: IdentificationFields = useMemo(
    () => ({
      ip: "sourceIp" as keyof WizardData,
      alias: "sourceAlias" as keyof WizardData,
      project: "project",
      identificationQuery: "sourceIdentificationQuery" as keyof WizardData,
      deviceId: "sourceDeviceId" as keyof WizardData,
      interfaceId: "sourceInterfaceId" as keyof WizardData,
      statsId: "sourceStatsId" as keyof WizardData,
      deviceAlias: "sourceDeviceAlias" as keyof WizardData,
      interfaceName: "sourceInterfaceName" as keyof WizardData,
      interfaceAlias: "sourceInterfaceAlias" as keyof WizardData,
    }),
    [],
  );

  return (
    <>
      <BandwidthChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        initialData={{
          deviceId: data.targetDeviceId || "",
          interfaceId: data.interfaceId || "",
          deviceAlias: data.targetDeviceAlias || undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          estimatedRecords: estimatedRecords || undefined,
        }}
      />
      <div className="bg-card shadow-soft dark:shadow-none rounded-xl border border-border overflow-hidden transition-colors duration-200">
        <div className="p-8">
          <h3 className="text-lg font-semibold text-text-main mb-6 flex items-center">
            <span className="material-icons mr-2 text-primary">hub</span>
            {isCloning
              ? "Paso 2: Configuración de Clonación (Donante -> Receptor)"
              : "Paso 2: Configuración de Reparación"}
          </h3>

          <div className="flex flex-col space-y-8 mb-8">
            {/* 1. INFORMACIÓN DE DISPOSITIVOS (Centro - Ancho completo) */}
            <div className="space-y-6">
              <DeviceInfoCard
                title="Receptor Seleccionado (Target)"
                variant="target"
                deviceId={data.targetDeviceId}
                deviceAlias={data.targetDeviceAlias}
                ip={data.ip}
                interfaceName={data.alias}
                statsId={data.statsId}
                className="w-full"
              />

              {/* SECCIÓN DE CLONACIÓN: Identificación de Fuente */}
              {isCloning && (
                <IdentificationSection
                  title="Identificación de Fuente (Donante)"
                  icon="content_copy"
                  variant="source"
                  fields={sourceFields}
                  isReady={isSourceReady}
                />
              )}
            </div>
            {/* 2. SELECCIÓN DE FECHAS  */}
            <div className="bg-background/40 p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
                  Rango de Fechas
                </h4>
                <button
                  onClick={() => setIsChartModalOpen(true)}
                  className="text-xs flex items-center text-primary hover:text-primary-hover font-medium transition-colors bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                >
                  <span className="material-icons text-sm mr-1.5">
                    ssid_chart
                  </span>
                  Visualizar Gráfica Original
                </button>
              </div>
              <p className="text-xs text-text-secondary mb-4 -mt-2">
                Formato:{" "}
                <code className="font-mono bg-background px-1 py-0.5 rounded">
                  DD-MM-AAAA HH:MM
                </code>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateTimeSliderPicker
                  label="Primer poleo fallido"
                  field="startDate"
                />
                <DateTimeSliderPicker
                  label="Último poleo fallido"
                  field="endDate"
                  hasError={!!dateError}
                />
              </div>
              {dateError && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                  <span className="material-icons text-sm mr-1">error</span>
                  {dateError}
                </p>
              )}

              {!isCloning && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
                        Dirección de Relleno
                      </span>
                      <span className="text-xs text-text-main mt-1">
                        {data.fillMode === "next"
                          ? "Usar datos POSTERIORES (Futuro)"
                          : "Usar datos PREVIOS (Pasado)"}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={data.fillMode === "next"}
                        onChange={(e) =>
                          updateField(
                            "fillMode",
                            e.target.checked ? "next" : "prev",
                          )
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {estimatedRecords !== null && (
                    <div className="mt-3 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded p-2 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center space-x-2">
                        <span className="material-icons text-blue-400 text-sm">
                          data_usage
                        </span>
                        <span className="text-xs text-blue-300">
                          Fuente estimada:{" "}
                          <strong className="text-blue-200">
                            {estimatedRecords} registros
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-400/70 font-mono">
                        {data.fillMode === "prev" ? "⏪" : "⏩"}{" "}
                        {Math.round(((estimatedRecords * 5) / 60) * 10) / 10}h
                      </span>
                    </div>
                  )}

                  <div className="mt-3 text-[10px] text-text-secondary bg-primary/5 p-2 rounded border border-primary/10 flex items-start">
                    <span className="material-icons text-primary text-sm mr-2 mt-0.5">
                      info
                    </span>
                    <p>
                      {data.fillMode === "next"
                        ? "Se tomarán los registros existentes DESPUÉS del hueco y se proyectarán hacia atrás para rellenar los datos faltantes."
                        : "Se tomarán los registros existentes ANTES del hueco y se proyectarán hacia adelante para rellenar los datos faltantes."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. SQL CANVAS (Abajo - Ancho completo) */}
            <div className="h-96 w-full" ref={canvasContainerRef}>
              <SqlCanvas
                stepIndicator="Progreso de Consultas (Acumulado)"
                query={cumulativeQuery}
                actionButtons={
                  cumulativeQuery && (
                    <SqlCanvasCopyButton text={cumulativeQuery} />
                  )
                }
              >
                {!cumulativeQuery && (
                  <div className="text-gray-500 italic text-xs flex flex-col items-center justify-center h-full">
                    <span className="material-icons text-4xl mb-2 opacity-20">
                      auto_fix_high
                    </span>
                    <p>
                      Complete todos los IDs y fechas para generar la query.
                    </p>
                  </div>
                )}
              </SqlCanvas>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-background/30 border-t border-border flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-background flex items-center"
          >
            <span className="material-icons mr-2 text-sm">arrow_back</span>{" "}
            Anterior
          </button>
          <button
            className="px-8 py-3 bg-primary hover:bg-primary-hover rounded-lg text-sm font-bold text-white shadow-lg flex items-center"
            onClick={() => setCurrentStep(3)}
            disabled={!data.timeShiftQuery || !!dateError}
          >
            Siguiente{" "}
            <span className="material-icons ml-2 text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
};
