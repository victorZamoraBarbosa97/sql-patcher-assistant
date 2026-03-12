import React from "react";
import type { WizardData } from "../../../types/wizard";
import { isValidIp } from "../../../utils/validators";
import { useWizardStore } from "../../../store/wizardStore";

interface TargetFormProps {
  onGenerate: () => void;
  ipField?: keyof WizardData;
  aliasField?: keyof WizardData;
  projectField?: keyof WizardData;
}

export const TargetForm: React.FC<TargetFormProps> = ({
  onGenerate,
  ipField = "ip",
  aliasField = "alias",
  projectField = "project",
}) => {
  const data = useWizardStore((state) => state.data);
  const updateField = useWizardStore((state) => state.updateField);

  const ipValue = (data[ipField] as string) || "";
  const aliasValue = (data[aliasField] as string) || "";
  const projectValue = (data[projectField] as string) || "";

  const isIpValid = isValidIp(ipValue);
  const isValid =
    isIpValid && aliasValue.trim() !== "" && projectValue.trim() !== "";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label
            className="block text-xs font-semibold text-text-secondary uppercase tracking-widest"
            htmlFor="project-select"
          >
            Proyecto
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-text-secondary text-sm">
                folder_open
              </span>
            </div>
            <select
              className="block w-full pl-10 pr-8 py-3 bg-input border border-border text-text-main rounded-lg focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
              id="project-select"
              value={projectValue}
              onChange={(e) => updateField(projectField, e.target.value)}
            >
              <option value="" disabled>
                Seleccionar...
              </option>
              <option value="PROYECTO_ALPHA">PROYECTO_ALPHA</option>
              <option value="PROYECTO_BETA">PROYECTO_BETA</option>
              <option value="ENLACE_DEDICADO_CORP">ENLACE_DEDICADO_CORP</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-icons text-text-secondary text-sm">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-semibold text-text-secondary uppercase tracking-widest"
            htmlFor="device-ip"
          >
            IP del Dispositivo
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-text-secondary text-sm">
                router
              </span>
            </div>
            <input
              className={`block w-full pl-10 pr-4 py-3 bg-input border ${
                ipValue && !isIpValid
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-primary focus:ring-primary"
              } text-text-main rounded-lg transition-all placeholder-text-secondary/50`}
              id="device-ip"
              value={ipValue}
              onChange={(e) => updateField(ipField, e.target.value)}
              placeholder="Ej: 10.24.55.101"
              type="text"
            />
          </div>
          {ipValue && !isIpValid && (
            <p className="text-red-500 text-[10px] mt-1 ml-1">
              Formato de IP inválido (ej: 192.168.1.1)
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            className="block text-xs font-semibold text-text-secondary uppercase tracking-widest"
            htmlFor="if-alias"
          >
            Alias de Interfaz
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-text-secondary text-sm">
                settings_input_component
              </span>
            </div>
            <input
              className="block w-full pl-10 pr-4 py-3 bg-input border border-border text-text-main rounded-lg focus:ring-primary focus:border-primary transition-all placeholder-text-secondary/50"
              id="if-alias"
              value={aliasValue}
              onChange={(e) => updateField(aliasField, e.target.value)}
              placeholder="Ej: Gi0/0/1 - Uplink"
              type="text"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onGenerate}
          className={`flex-1 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 group ${!isValid ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
        >
          <span className="material-icons group-hover:scale-110 transition-transform">
            code
          </span>
          <span>GENERAR QUERY</span>
        </button>
      </div>
    </>
  );
};
