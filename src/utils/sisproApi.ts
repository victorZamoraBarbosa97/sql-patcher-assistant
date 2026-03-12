// OJO CON el PHPSESSID en las llamadas a Sispro, puede requerir un proxy para evitar problemas de CORS en desarrollo.
import { parseDate } from "./dateUtils";

export interface ChartDataPoint {
  Description: string;
  Fecha: string;
  Entrada?: number;
  Salida?: number;
  Promedio?: number;
}

export const extractSiteId = (deviceName: string): string => {
  // Caso 1: ID236_MPLS... -> 236
  const matchId = deviceName.match(/ID(\d+)/i);
  if (matchId && matchId[1]) {
    return matchId[1].padStart(4, "0");
  }

  // Caso 2: 32rpv... -> 32 (Inicia con dígitos)
  const matchStart = deviceName.match(/^(\d+)/);
  if (matchStart && matchStart[1]) {
    return matchStart[1].padStart(4, "0");
  }
  return "";
};

const getMockData = (
  registros: number,
  startDate?: string,
  endDate?: string,
  gapStartDate?: string,
  gapEndDate?: string,
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let startMs: number;
  let endMs: number;
  let gapStartMs: number | null = null;
  let gapEndMs: number | null = null;

  if (startDate && endDate) {
    startMs = parseDate(startDate).getTime();
    endMs = parseDate(endDate).getTime();
    if (gapStartDate && gapEndDate) {
      gapStartMs = parseDate(gapStartDate).getTime();
      gapEndMs = parseDate(gapEndDate).getTime();
    }
  } else {
    endMs = new Date().getTime();
    // Fallback: 5 minutos por registro (frecuencia estándar de poleo)
    startMs = endMs - registros * 5 * 60000;
  }

  const step = registros > 1 ? (endMs - startMs) / (registros - 1) : 0;

  // Generar puntos de datos simulados interpolados
  for (let i = 0; i < registros; i++) {
    const d = new Date(startMs + i * step);

    // Simular hueco: Si la fecha está dentro del rango del hueco, no generamos datos
    if (
      gapStartMs &&
      gapEndMs &&
      d.getTime() >= gapStartMs &&
      d.getTime() <= gapEndMs
    ) {
      continue;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const dateStr = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    // Simular tráfico aleatorio pero coherente
    const baseIn = 50000000 + Math.random() * 30000000;
    const baseOut = 40000000 + Math.random() * 20000000;

    data.push({
      Description: "Interface Demo (Datos Simulados)",
      Fecha: dateStr,
      Entrada: Math.floor(baseIn),
      Salida: Math.floor(baseOut),
      Promedio: Math.floor((baseIn + baseOut) / 2),
    });
  }
  console.log("📊 [MockData] Generated mock data:", data);
  return data;
};

export const fetchSisproChartData = async (params: {
  equipo: string;
  interfaceId: string;
  sitio: string;
  ref: string;
  startDate: string; // Format: DD-MM-YYYY HH:mm
  endDate: string; // Format: DD-MM-YYYY HH:mm
  records?: number;
  gapStartDate?: string;
  gapEndDate?: string;
}): Promise<ChartDataPoint[]> => {
  console.log(
    "📡 [SisproAPI] Portfolio Mode: Generating mock data for params:",
    params,
  );
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 800));
  return getMockData(
    params.records || 50,
    params.startDate,
    params.endDate,
    params.gapStartDate,
    params.gapEndDate,
  );
};
