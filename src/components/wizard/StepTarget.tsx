// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\StepTarget.tsx
import React, { useMemo } from "react";
import { isValidIp } from "../../utils/validators";
import { ModeSelector } from "./target/ModeSelector";
import {
  IdentificationSection,
  type IdentificationFields,
} from "../common/IdentificationSection";
import { useWizardStore } from "../../store/wizardStore";
import { Button } from "../ui/Button";
import type { WizardData } from "../../types/wizard";

export const StepTarget: React.FC = () => {
  const data = useWizardStore((state) => state.data);
  const setCurrentStep = useWizardStore((state) => state.setCurrentStep);

  const isIpValid = isValidIp(data.ip);

  const isFormValid =
    isIpValid && data.alias.trim() !== "" && (data.project || "").trim() !== "";

  const isNextEnabled =
    isFormValid &&
    data.identificationQuery &&
    data.targetDeviceId &&
    data.interfaceId &&
    data.statsId;

  const targetFields: IdentificationFields = useMemo(
    () => ({
      ip: "ip",
      alias: "alias",
      project: "project",
      identificationQuery: "identificationQuery",
      deviceId: "targetDeviceId",
      interfaceId: "interfaceId",
      statsId: "statsId",
      deviceAlias: "targetDeviceAlias" as keyof WizardData,
      interfaceName: "interfaceName" as keyof WizardData,
      interfaceAlias: "interfaceAlias" as keyof WizardData,
    }),
    [],
  );

  return (
    <>
      <div className="bg-card shadow-soft dark:shadow-none rounded-xl border border-border overflow-hidden transition-colors duration-200">
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <span className="material-icons text-primary">gps_fixed</span>
            <h2 className="text-xl font-bold text-text-main">
              Paso 1: Identificación del Objetivo (Target)
            </h2>
          </div>
          <p className="text-text-secondary text-sm mb-8">
            Introduzca los datos del dispositivo y la interfaz de destino para
            generar la consulta de identificación.
          </p>

          <ModeSelector />

          <IdentificationSection
            fields={targetFields}
            isReady={!!isNextEnabled}
            title="Identificación de Objetivo (Receptor)"
            icon=""
            variant="target"
          />
        </div>

        <div className="px-8 py-4 bg-background/30 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-secondary flex items-center italic">
            <span className="material-icons text-xs mr-1">info</span>
            Ejecute la query manualmente en su BD
          </span>
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" disabled>
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="md"
              disabled={!isNextEnabled}
              onClick={() => setCurrentStep(2)}
              iconRight={<span className="material-icons">chevron_right</span>}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
