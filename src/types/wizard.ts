export type PatchType = "timeShift" | "cloning";

export interface WizardData {
  // Configuración General
  patchType: PatchType;
  project: string;

  // Target (Receptor / Interfaz a reparar)
  ip: string;
  alias: string;
  statsId: string; // STATSTABLEID del Target
  interfaceId: string; // INTERFACE_ID del Target
  targetDeviceId?: string; // DEVICE_ID del Target (Nuevo: necesario para el mapeo en clonación)
  targetDeviceAlias?: string | null;

  // Source (Donante - Solo para modo Clonación)
  sourceIp?: string;
  sourceAlias?: string;
  sourceStatsId?: string; // STATSTABLEID del Source
  sourceInterfaceId?: string; // INTERFACE_ID del Source
  sourceDeviceId?: string; // DEVICE_ID del Source

  // Fechas (Rango a copiar/reparar)
  startDate: string;
  endDate: string;

  // Queries
  identificationQuery?: string | null; // Query para identificar Target
  sourceIdentificationQuery?: string | null; // Query para identificar Source (Nuevo)
  timeShiftQuery?: string | null; // Query principal (Action Query)
  generatedQuery?: string | null; // Legacy

  //configuración adicional
  fillMode?: "prev" | "next";
}
