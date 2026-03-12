import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {
  fetchSisproChartData,
  extractSiteId,
  type ChartDataPoint,
} from "../../utils/sisproApi";
import { parseDate, formatDateForSispro } from "../../utils/dateUtils";

interface BandwidthChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRange?: (start: string, end: string) => void;
  initialData: {
    deviceId: string;
    interfaceId: string;
    siteId?: string;
    deviceAlias?: string;
    startDate?: string;
    endDate?: string;
    estimatedRecords?: number;
  };
  inline?: boolean;
  className?: string;
}

// Cache global para persistir datos entre montajes (evita recargas al navegar entre pasos)
const chartDataCache = new Map<string, ChartDataPoint[]>();

export const BandwidthChartModal: React.FC<BandwidthChartModalProps> = ({
  isOpen,
  onClose,
  initialData,
  inline = false,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [siteId, setSiteId] = useState(
    initialData.siteId ||
      extractSiteId(initialData.deviceAlias || "") ||
      "0001",
  );

  // Detectar tema (claro/oscuro) dinámicamente
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Interaction state
  const [interactionMode, setInteractionMode] = useState<
    "select" | "pan" | "zoom"
  >("pan"); // Default to pan as per example style

  const chartDivRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const xAxisRef = useRef<am5xy.DateAxis<am5xy.AxisRenderer> | null>(null);

  // Determine fetch range (props > last 7 days)
  const getDates = useCallback(() => {
    if (initialData.startDate && initialData.endDate) {
      // const start = new Date(initialData.startDate);
      // const end = new Date(initialData.endDate);
      const start = parseDate(initialData.startDate);
      const end = parseDate(initialData.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Calcular duración del rango seleccionado
        const duration = end.getTime() - start.getTime();

        // Expandir rango: -1x duración antes, +1x duración después (Total 3x)
        const expandedStart = new Date(start.getTime() - duration);
        const expandedEnd = new Date(end.getTime() + duration);

        return {
          start: formatDateForSispro(expandedStart),
          end: formatDateForSispro(expandedEnd),
        };
      }
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return { start: formatDateForSispro(start), end: formatDateForSispro(end) };
  }, [initialData.startDate, initialData.endDate]);

  // Sincronizar siteId y limpiar datos cuando cambian los props principales (Evita mostrar datos de otro dispositivo)
  useEffect(() => {
    setSiteId(
      initialData.siteId ||
        extractSiteId(initialData.deviceAlias || "") ||
        "0001",
    );
    setChartData([]);
  }, [
    initialData.deviceId,
    initialData.interfaceId,
    initialData.siteId,
    initialData.deviceAlias,
  ]);

  const handleFetch = useCallback(
    async (e?: unknown) => {
      // Si 'e' existe (es un evento de click), forzamos la recarga ignorando la caché
      const forceRefresh = !!e;

      if (!initialData.deviceId || !initialData.interfaceId || !siteId) {
        setError("Faltan datos requeridos (Device ID, Interface ID, Sitio)");
        return;
      }

      setLoading(true);
      setError(null);
      const dates = getDates();
      const cacheKey = `${initialData.deviceId}-${initialData.interfaceId}-${siteId}-${dates.start}-${dates.end}`;

      if (!forceRefresh && chartDataCache.has(cacheKey)) {
        setChartData(chartDataCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchSisproChartData({
          equipo: initialData.deviceId,
          interfaceId: initialData.interfaceId,
          sitio: siteId,
          ref: siteId,
          startDate: dates.start,
          endDate: dates.end,
          // Multiplicamos por 3 porque estamos visualizando 3 veces el tiempo del hueco (antes + hueco + después)
          // Si no lo hacemos, los puntos se verán muy separados (baja resolución).
          records: initialData.estimatedRecords
            ? initialData.estimatedRecords * 3
            : 50,
          gapStartDate: initialData.startDate,
          gapEndDate: initialData.endDate,
        });
        chartDataCache.set(cacheKey, data);
        setChartData(data);
      } catch (err) {
        setError("Error al cargar datos. Verifique la conexión o los IDs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [
      initialData.deviceId,
      initialData.interfaceId,
      siteId,
      getDates,
      initialData.estimatedRecords,
      initialData.startDate,
      initialData.endDate,
    ],
  );

  // Auto-load data when modal opens or if inline
  useEffect(() => {
    if (
      (isOpen || inline) &&
      chartData.length === 0 && // Only fetch if we don't have data
      initialData.deviceId &&
      initialData.interfaceId
    ) {
      handleFetch();
    }
  }, [
    isOpen,
    inline,
    chartData.length,
    initialData.deviceId,
    initialData.interfaceId,
    handleFetch,
  ]);

  // Initialize Chart
  useLayoutEffect(() => {
    if (!chartDivRef.current) return;

    // Limpieza preventiva por si acaso existe una instancia previa
    if (rootRef.current) {
      rootRef.current.dispose();
    }

    if (chartData.length === 0) return;

    // 1. Crear el elemento raíz de AmCharts
    const root = am5.Root.new(chartDivRef.current);
    rootRef.current = root;

    const axisTextColor = isDark ? 0xffffff : 0x000000;

    // 2. Configurar tema visual con animaciones
    root.setThemes([am5themes_Animated.new(root)]);

    // 3. Instanciar el gráfico principal
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      }),
    );
    chartRef.current = chart;

    // 4. Añadir el cursor interactivo
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none", // Se actualizará con interactionMode
      }),
    );
    cursor.lineY.set("visible", false);

    // 5. Configurar el eje X (Tiempo)
    const xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.labels.template.setAll({
      fill: am5.color(axisTextColor),
      fontSize: 12,
    });

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: "minute",
          count: 5,
        },
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );
    xAxisRef.current = xAxis;

    // 6. Configurar el eje Y (Valores)
    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fill: am5.color(axisTextColor),
      fontSize: 12,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
      }),
    );

    // 7. Función auxiliar para crear las series
    function crearSerie(nombre: string, campoDatos: string, colorHex: number) {
      const color = am5.color(colorHex);
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: nombre,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: campoDatos,
          valueXField: "date",
          stroke: color,
          fill: color,
          connect: false,
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: [bold]{valueY}[/]",
          }),
        }),
      );

      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      return series;
    }

    const seriesEntrada = crearSerie("Entrada", "Entrada", 0x3b82f6); // Azul
    const seriesSalida = crearSerie("Salida", "Salida", 0x22c55e); // Verde
    const seriesPromedio = crearSerie("Promedio", "Promedio", 0xef4444); // Roja

    // 8. Barra de desplazamiento temporal
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      }),
    );

    // 9. Leyenda superior
    const legend = am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      marginTop: 0,
      marginBottom: 5,
    });
    // Agregar al contenedor de ejes superior para garantizar que esté arriba y no se solape
    chart.topAxesContainer.children.push(legend);

    legend.data.setAll(chart.series.values);

    // 10. Procesar datos
    const datosProcesados = chartData.map((item: ChartDataPoint) => {
      // Asegurar que los valores sean numéricos, convirtiendo strings o undefined a 0
      return {
        date: parseDate(item.Fecha).getTime(),
        Entrada: Number(item.Entrada) || 0,
        Salida: Number(item.Salida) || 0,
        Promedio: Number(item.Promedio) || 0,
      };
    });

    datosProcesados.sort((a, b) => a.date - b.date);

    seriesEntrada.data.setAll(datosProcesados);
    seriesSalida.data.setAll(datosProcesados);
    seriesPromedio.data.setAll(datosProcesados);

    seriesEntrada.appear(1000);
    seriesSalida.appear(1000);
    seriesPromedio.appear(1000);
    chart.appear(1000, 100);

    // 11. Agregar guías visuales para el rango original (Hueco)
    // Esto ayuda a distinguir entre los datos expandidos (-1x...+1x) y el hueco real
    // const startTs = initialData.startDate
    //   ? new Date(initialData.startDate).getTime()
    //   : NaN;
    // const endTs = initialData.endDate
    //   ? new Date(initialData.endDate).getTime()
    //   : NaN;
    const startTs = parseDate(initialData.startDate).getTime();
    const endTs = parseDate(initialData.endDate).getTime();

    if (!isNaN(startTs) && !isNaN(endTs)) {
      const createGuide = (time: number, label: string) => {
        const rangeDataItem = xAxis.makeDataItem({
          value: time,
        });

        const range = xAxis.createAxisRange(rangeDataItem);

        range.get("grid")?.setAll({
          stroke: am5.color(0xff4444), // Rojo para destacar
          strokeOpacity: 0.8,
          strokeDasharray: [4, 4],
        });

        range.get("label")?.setAll({
          text: label,
          inside: true,
          // top: true,
          fill: am5.color(axisTextColor),
          fontSize: 11,
          fontWeight: "bold",
          background: am5.RoundedRectangle.new(root, {
            fill: am5.color(isDark ? 0x000000 : 0xffffff),
            fillOpacity: 0.7,
          }),
        });
      };

      createGuide(startTs, "INICIO HUECO");
      createGuide(endTs, "FIN HUECO");
    }

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [chartData, isDark, initialData.startDate, initialData.endDate]);

  // Update interaction mode dynamically
  useEffect(() => {
    if (!chartRef.current || !rootRef.current) return;
    const chart = chartRef.current;
    const cursor = chart.get("cursor");
    if (!cursor) return;

    if (interactionMode === "pan") {
      cursor.set("behavior", "none");
      chart.set("panX", true);
    } else if (interactionMode === "zoom") {
      cursor.set("behavior", "zoomX");
      chart.set("panX", false);
    } else if (interactionMode === "select") {
      cursor.set("behavior", "selectX");
      chart.set("panX", false);
    }
  }, [interactionMode]);

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.zoomOut();
    }
  };

  const content = (
    <div
      className={
        inline
          ? `w-full h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm transition-colors duration-200 ${className}`
          : `fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`
      }
    >
      <div
        className={
          inline
            ? "flex flex-col h-full"
            : "bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
        }
      >
        <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-blue-400">show_chart</span>
            <h3 className="font-bold text-text-main text-base m-0 mr-5">
              Grafica de Interfaz
            </h3>
            <div
              className="flex items-center space-x-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full cursor-help"
              title="Datos generados dinámicamente para fines demostrativos."
            >
              <span className="material-icons text-orange-500 text-[10px]">
                science
              </span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider hidden sm:inline">
                Datos Simulados
              </span>
            </div>
          </div>
          {!inline && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-main transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        <div className="p-2 border-b border-border bg-card space-y-2">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-0">
              <label className="text-xs text-text-secondary uppercase font-bold">
                Sitio ID
              </label>
              <input
                type="text"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="block w-32 px-3 py-2 bg-input border border-border rounded text-sm text-text-main focus:border-primary outline-none transition-colors"
                placeholder="Ej: 0236"
              />
            </div>
            <div className="space-y-0">
              <label className="text-xs text-text-secondary uppercase font-bold">
                Device ID
              </label>
              <input
                type="text"
                value={initialData.deviceId}
                disabled
                className="block w-32 px-3 py-2 bg-input/50 border border-border rounded text-sm text-text-secondary cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded text-sm font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="material-icons animate-spin text-sm mr-2">
                  refresh
                </span>
              ) : (
                <span className="material-icons text-sm mr-2">
                  cloud_download
                </span>
              )}
              Cargar Gráfica
            </button>
          </div>
          {error && (
            <div className="text-red-400 text-xs flex items-center bg-red-900/10 p-2 rounded border border-red-900/30">
              <span className="material-icons text-sm mr-2">error_outline</span>
              {error}
            </div>
          )}
        </div>

        {/* Chart Toolbar */}
        {chartData.length > 0 && (
          <div className="px-3 py-1 bg-background/50 border-b border-border flex justify-between items-center">
            <div className="text-xs text-text-secondary font-mono flex items-center">
              <span className="material-icons text-xs mr-1 text-yellow-500">
                info
              </span>
              Use el scroll inferior o la rueda del mouse para navegar.
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-input rounded p-0.5 border border-border">
                <button
                  onClick={() => setInteractionMode("pan")}
                  className={`px-3 py-1 rounded text-xs flex items-center transition-colors ${interactionMode === "pan" ? "bg-primary text-white" : "text-text-secondary hover:text-text-main"}`}
                  title="Mover (Pan)"
                >
                  <span className="material-icons text-xs mr-1">pan_tool</span>
                  Pan
                </button>
                <button
                  onClick={() => setInteractionMode("zoom")}
                  className={`px-3 py-1 rounded text-xs flex items-center transition-colors ${interactionMode === "zoom" ? "bg-primary text-white" : "text-text-secondary hover:text-text-main"}`}
                  title="Zoom (Arrastrar para acercar)"
                >
                  <span className="material-icons text-xs mr-1">zoom_in</span>
                  Zoom
                </button>
              </div>

              <div className="h-4 w-px bg-border"></div>

              <button
                onClick={handleResetZoom}
                className="px-3 py-1 bg-card border border-border hover:bg-background text-text-main text-xs rounded transition-colors flex items-center"
              >
                <span className="material-icons text-xs mr-1">zoom_out</span>
                Ver Todo
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative bg-background/20 p-4 flex flex-col items-center justify-center min-h-100">
          {chartData.length > 0 ? (
            <div
              ref={chartDivRef}
              style={{ width: "100%", height: "100%", minHeight: "400px" }}
            ></div>
          ) : (
            <div className="text-text-secondary flex flex-col items-center">
              <span className="material-icons text-5xl mb-2 opacity-20">
                ssid_chart
              </span>
              <p className="text-sm">
                Cargue los datos para visualizar la gráfica
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-background/50 flex justify-between items-center">
          <div className="text-xs text-text-secondary">
            Haga zoom para definir el rango visible.
          </div>
          <div className="flex space-x-3">
            {!inline && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-card hover:bg-background border border-border rounded-lg text-sm font-medium text-text-secondary hover:text-text-main shadow-sm transition-all flex items-center"
              >
                <span className="material-icons text-sm mr-2">close</span>
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (inline) return content;
  return createPortal(content, document.body);
};
