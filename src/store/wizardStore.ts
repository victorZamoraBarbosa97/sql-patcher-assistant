import { create } from "zustand";
import type { WizardData } from "../types/wizard";
import { devtools } from "zustand/middleware";

// Estado inicial para los datos del wizard
const initialData: WizardData = {
  patchType: "timeShift",
  project: "",

  // Target (Receptor / Interfaz a reparar)
  ip: "",
  alias: "",
  statsId: "",
  interfaceId: "",
  targetDeviceId: "",
  targetDeviceAlias: "",

  // Source (Donante - Solo para modo Clonación)
  sourceIp: "",
  sourceAlias: "",
  sourceStatsId: "",
  sourceInterfaceId: "",
  sourceDeviceId: "",

  // fechas
  startDate: "",
  endDate: "",

  //Querys
  generatedQuery: null,
  identificationQuery: null,
  sourceIdentificationQuery: null,
  timeShiftQuery: null,

  //configuración adicional
  fillMode: "prev",
};

// Definición del tipo para el estado del store
interface WizardState {
  currentStep: number;
  data: WizardData;
  setCurrentStep: (step: number) => void;
  updateField: (field: keyof WizardData, value: string | null) => void;
  reset: () => void;
}

export const useWizardStore = create(
  devtools<WizardState>(
    (set) => ({
      currentStep: 1,
      data: initialData,
      setCurrentStep: (step) => set({ currentStep: step }),
      updateField: (field, value) =>
        set((state) => ({ data: { ...state.data, [field]: value } })),
      reset: () => set({ currentStep: 1, data: initialData }),
    }),
    { name: "WizardStore" },
  ),
);
