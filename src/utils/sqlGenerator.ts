/**
 * WARNING: This file generates SQL for PREVIEW purposes only.
 * DO NOT execute these strings directly on the database without strict sanitization
 * or moving this logic to a secure backend environment.
 */
import type { WizardData } from "../types/wizard";

interface WizardDataWithSource extends WizardData {
  sourceIdentificationQuery?: string;
}

// Mapeo de configuración de proyectos
export const PROJECT_IDS: Record<string, number> = {
  PROYECTO_ALPHA: 1,
  PROYECTO_BETA: 1,
  ENLACE_DEDICADO_CORP: 5,
};

const formatSqlDate = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const pad3 = (n: number) => n.toString().padStart(3, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad3(d.getMilliseconds())}`;
};

// Helper para parsear fechas de forma segura (soporta DD-MM-YYYY y ISO)
const parseDateSafe = (dateStr: string): number => {
  const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (match) {
    const [, d, m, y, h, min] = match;
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(h),
      Number(min),
    ).getTime();
  }
  return new Date(dateStr).getTime();
};

// Genera query para identificar un dispositivo (usado para Target y Source)
export const generateIdentificationQuery = (
  ip: string,
  alias: string,
  project: string,
): string => {
  const projectId = PROJECT_IDS[project];
  const projectFilter = projectId ? ` AND D.PROJECT_ID = ${projectId}` : "";

  return `SELECT 
    D.PROJECT_ID AS PROJECT_ID,
    D.ID AS DEVICE_ID,
    D.ALIAS AS DEVICE_ALIAS,
    D.IP, D.STATSTABLEID,
    I.ID AS INTERFACE_ID,
    I.NAME AS INTERFACE_NAME,
    I.ALIAS
FROM DEVICE D JOIN INTERFACE I ON ( D.ID = I.DEVICE_ID )
WHERE D.IP = '${ip}' AND I.ALIAS LIKE '%${alias}%'${projectFilter};`;
};

// Lógica del Caso 1: Time Shift (Misma interfaz)
const generateTimeShiftSql = (data: WizardData): string => {
  const dateInicio = new Date(data.startDate);
  const dateFin = new Date(data.endDate);
  const msInicio = dateInicio.getTime();
  const msFin = dateFin.getTime();
  const diferenciaMs = msFin - msInicio;

  // Rango de validación ampliado: [Inicio - Duración, Fin + Duración]
  const validationStartStr = formatSqlDate(msInicio - diferenciaMs);
  const validationEndStr = formatSqlDate(msFin + diferenciaMs);

  const isNext = data.fillMode === "next";
  let msMoldeInicio: number;
  let msMoldeFin: number;
  let shiftOperator: string;
  let sourceDescription: string;

  if (isNext) {
    // Usar datos futuros (después del hueco) para rellenar hacia atrás
    msMoldeInicio = msFin + 1000; // +1 segundo para evitar solapamiento
    msMoldeFin = msFin + diferenciaMs;
    shiftOperator = "-";
    sourceDescription = "Periodo posterior (Futuro)";
  } else {
    // Usar datos pasados (antes del hueco) para rellenar hacia adelante - Default
    msMoldeInicio = msInicio - diferenciaMs;
    msMoldeFin = msInicio - 1000; // -1 segundo para evitar solapamiento
    shiftOperator = "+";
    sourceDescription = "Periodo anterior (Pasado)";
  }

  return `-- ESCENARIO 1: REPARACIÓN (TIME SHIFT)
-- Tabla: TRAFFIC_HISTORY_PARTITION_${data.statsId} | Interfaz: ${data.interfaceId}
-- Rango Hueco: ${data.startDate.replace("T", " ")} a ${data.endDate.replace("T", " ")}
-- Fuente de datos: ${sourceDescription}

# 1. LIMPIAR TABLA DE PASO
TRUNCATE TABLE TEMP_BUFFER_TABLE;

#2. VALIDACIÓN PREVIA: Verificar datos existentes (Rango ampliado: -1x Duración ... +1x Duración) IMPORTANTE VERIFICAR FECHAS CORRECTAS DE COMIENZO DE ERRORES DE POLEOS
SELECT FROM_UNIXTIME(TIME/1000) AS TIME, OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, INTERFACEID
FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}	
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN CAST(UNIX_TIMESTAMP('${validationStartStr}') * 1000 AS UNSIGNED) AND CAST(UNIX_TIMESTAMP('${validationEndStr}') * 1000 AS UNSIGNED);


# 3. CARGAR DATOS MOLDE
INSERT INTO TEMP_BUFFER_TABLE (OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, TIME, INTERFACEID)
SELECT OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, TIME, INTERFACEID
FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msMoldeInicio} AND ${msMoldeFin};

# 4. ACTUALIZAR FECHAS EN PASO_BW (Desplazamiento temporal)
UPDATE TEMP_BUFFER_TABLE SET TIME = TIME ${shiftOperator} ${diferenciaMs};

# 5. VERIFICAR DATOS EN LA TABLA TEMPORAL (PASO_BW)
SELECT FROM_UNIXTIME(TIME/1000) AS TIME, OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, INTERFACEID
FROM TEMP_BUFFER_TABLE;


# 6. VERIFICAR SI EXISTEN REGISTROS EN EL RANGO DEL HUECO.
SELECT FROM_UNIXTIME(TIME/1000) AS TIME, OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, INTERFACEID
FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};

# 7. SI EXISTEN REGISTROS DENTRO DEL HUECO ELIMINARLOS (HUECO)
# ⚠️ ADVERTENCIA: Realice un backup de la tabla antes de ejecutar este comando.
DELETE FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};`;
};

// Lógica del Caso 2: Clonación (Diferente interfaz/equipo)
const generateCloningSql = (data: WizardData): string => {
  if (
    !data.sourceStatsId ||
    !data.sourceInterfaceId ||
    !data.sourceDeviceId ||
    !data.targetDeviceId
  ) {
    return "-- Faltan datos del Donante (Source) o del Receptor (Target) para generar la query de clonación.";
  }

  const msInicio = parseDateSafe(data.startDate || "");
  const msFin = parseDateSafe(data.endDate || "");

  return `-- ESCENARIO 2: CLONACIÓN DE INTERFAZ
-- Donante (Source): Tabla PARTITION_${data.sourceStatsId} | DevID: ${data.sourceDeviceId} | IntID: ${data.sourceInterfaceId}
-- Receptor (Target): Tabla PARTITION_${data.statsId} | DevID: ${data.targetDeviceId} | IntID: ${data.interfaceId}

# 0.1. CONSULTAR VALORES A ELIMINAR (Target)
SELECT from_unixtime(TIME/1000) AS TIME, OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, INTERFACEID
FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};

# 0.2. CONSULTAR VALORES A INSERTAR (Source)
SELECT from_unixtime(TIME/1000) AS TIME, OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, INTERFACEID
FROM TRAFFIC_HISTORY_PARTITION_${data.sourceStatsId}
WHERE INTERFACEID = ${data.sourceInterfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};

# 1. ELIMINAR DATOS EN RECEPTOR (Evitar duplicados)
# ⚠️ ADVERTENCIA: Realice un backup de la tabla antes de ejecutar este comando.
DELETE FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};`;
};

// Helper para generar solo la parte del INSERT en clonación (para el Paso 3)
const generateCloningInsertSql = (data: WizardData): string => {
  const msInicio = parseDateSafe(data.startDate || "");
  const msFin = parseDateSafe(data.endDate || "");

  return `# 2. INSERTAR DATOS DESDE DONANTE CON MAPEO DE IDs
INSERT INTO TRAFFIC_HISTORY_PARTITION_${data.statsId}
(OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, TIME, INTERFACEID)
SELECT 
    OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, 
    CASE 
        WHEN DEVICEID = '${data.sourceDeviceId}' THEN '${data.targetDeviceId}' 
        ELSE DEVICEID 
    END AS DEVICEID, 
    OPERATIVESTATUS, LASTCHANGE, TIME, 
    CASE 
        WHEN INTERFACEID = '${data.sourceInterfaceId}' THEN '${data.interfaceId}' 
        ELSE INTERFACEID 
    END AS INTERFACEID 
FROM TRAFFIC_HISTORY_PARTITION_${data.sourceStatsId}
WHERE INTERFACEID = '${data.sourceInterfaceId}' 
AND TIME BETWEEN ${msInicio} AND ${msFin};`;
};

export const generateTimeShiftQuery = (data: WizardData): string => {
  if (!data.statsId || !data.interfaceId || !data.startDate || !data.endDate) {
    return "-- Complete los campos de IDs y Fechas.";
  }

  if (data.patchType === "cloning") {
    return generateCloningSql(data);
  } else {
    return generateTimeShiftSql(data);
  }
};

export const generateFinalInjectionQuery = (data: WizardData): string => {
  const extendedData = data as WizardDataWithSource;
  const previousQueries = [
    data.identificationQuery
      ? `-- PASO 1: IDENTIFICACIÓN\n${data.identificationQuery}`
      : "",
    extendedData.sourceIdentificationQuery
      ? `-- PASO 1 (FUENTE): IDENTIFICACIÓN\n${extendedData.sourceIdentificationQuery}`
      : "",
    data.timeShiftQuery ? `-- PASO 2: PREPARACIÓN\n${data.timeShiftQuery}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  if (data.patchType === "cloning") {
    return `${previousQueries}\n\n${generateCloningInsertSql(data)}`;
  }

  return `${previousQueries}

-- PASO 3: EJECUCIÓN (INYECCIÓN FINAL)
INSERT INTO TRAFFIC_HISTORY_PARTITION_${data.statsId || "XXXX"} (OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, TIME, INTERFACEID)
SELECT OUTBROADCASTPKTS, OUTOCTETS, INMULTICASTPKTS, INERRORS, OUTUCASTPKTS, OUTMULTICASTPKTS, INOCTETS, INUCASTPKTS, INDISCARDS, OUTDISCARDS, OUTERRORS, INBROADCASTPKTS, DEVICEID, OPERATIVESTATUS, LASTCHANGE, TIME, INTERFACEID
FROM TEMP_BUFFER_TABLE;`;
};

export const generateRollbackQuery = (data: WizardData): string => {
  if (!data.statsId || !data.interfaceId || !data.startDate || !data.endDate) {
    return "-- Faltan datos para generar el rollback (IDs o Fechas).";
  }

  const msInicio = parseDateSafe(data.startDate);
  const msFin = parseDateSafe(data.endDate);

  return `-- ROLLBACK: ELIMINAR DATOS INSERTADOS (RESTAURAR HUECO)
-- ⚠️ ADVERTENCIA: Esta acción eliminará TODOS los registros en el rango seleccionado para esta interfaz.
-- Se recomienda verificar que el rango de fechas sea exactamente el que se usó para la inyección.
--
-- Tabla: TRAFFIC_HISTORY_PARTITION_${data.statsId}
-- Interfaz ID: ${data.interfaceId}
-- Rango: ${data.startDate.replace("T", " ")} al ${data.endDate.replace("T", " ")}

DELETE FROM TRAFFIC_HISTORY_PARTITION_${data.statsId}
WHERE INTERFACEID = ${data.interfaceId}
AND TIME BETWEEN ${msInicio} AND ${msFin};`;
};
