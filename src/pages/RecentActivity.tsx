import React, { useEffect, useState, useCallback } from "react";
import {
  getInjections,
  type InjectionLog,
} from "../services/injectionLogService";
import { Modal } from "../components/ui/Modal";
import { Timestamp } from "firebase/firestore";
import { SqlCanvasCopyButton } from "../components/ui/SqlCanvas";

export const RecentActivity: React.FC = () => {
  const [logs, setLogs] = useState<InjectionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<InjectionLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"injection" | "rollback">(
    "injection",
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInjections(50); // Traer los últimos 50 registros
      setLogs(data);
    } catch (error) {
      console.error("Error loading activity:", error);
      setError("No se pudo cargar el historial. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleViewDetailsClick = (log: InjectionLog) => {
    setSelectedLog(log);
    setActiveTab("injection");
    setIsModalOpen(true);
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return "Pendiente...";

    // The object from Firestore always has a .toDate() method.
    return timestamp.toDate().toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-12">
      {/* Modal para mostrar el Rollback SQL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalles de Operación SQL"
        type="info"
      >
        <div className="space-y-4">
          {/* Selector de Pestañas */}
          <div className="flex space-x-1 bg-input/50 p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab("injection")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "injection"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Inyección SQL
            </button>
            <button
              onClick={() => setActiveTab("rollback")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "rollback"
                  ? "bg-red-500/80 hover:bg-red-500 text-white shadow-sm"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              Rollback SQL
            </button>
          </div>

          <p className="text-sm text-text-secondary">
            {activeTab === "injection"
              ? "Consulta generada para aplicar los cambios."
              : "Ejecute esta consulta para deshacer los cambios realizados."}
          </p>

          {selectedLog && (
            <div className="bg-background-dark p-4 rounded-md border border-border overflow-x-auto max-h-[60vh]">
              <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap break-all">
                {activeTab === "injection"
                  ? selectedLog.injectionQuery
                  : selectedLog.rollbackQuery}
              </pre>
            </div>
          )}
          <div className="flex justify-end pt-2">
            {selectedLog && (
              <SqlCanvasCopyButton
                text={
                  activeTab === "injection"
                    ? selectedLog.injectionQuery
                    : selectedLog.rollbackQuery
                }
                label={`Copiar ${activeTab === "injection" ? "Inyección" : "Rollback"}`}
                className="bg-primary text-white hover:bg-primary-hover"
              />
            )}
          </div>
        </div>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-text-secondary">
            history
          </span>
          <h3 className="text-lg font-bold text-text-main">
            Historial de Inyecciones
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-text-secondary bg-card border border-border rounded hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              className={`material-icons text-xs mr-1 ${loading ? "animate-spin" : ""}`}
            >
              refresh
            </span>{" "}
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-card shadow-soft dark:shadow-none rounded-lg border border-border overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-background/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Objetivo (Target)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Rango Afectado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <span className="material-icons animate-spin text-primary mr-2">
                      sync
                    </span>
                    <span className="text-sm text-text-secondary">
                      Cargando historial...
                    </span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-text-secondary"
                  >
                    No hay registros de actividad reciente.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.patchType === "cloning"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {log.patchType === "cloning"
                          ? "Clonación"
                          : log.patchType === "timeShift"
                            ? "Time Shift"
                            : "Reparación"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-main">
                          {log.target.alias}
                        </span>
                        <span className="text-xs text-text-secondary font-mono">
                          {log.target.ip}
                        </span>
                        {log.target.interfaceName && (
                          <span className="text-[10px] text-text-secondary mt-0.5">
                            {log.target.interfaceName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">
                      <div>
                        <span className="font-bold">Inicio:</span>{" "}
                        {log.dateRange.start?.replace("T", " ")}
                      </div>
                      <div>
                        <span className="font-bold">Fin:</span>{" "}
                        {log.dateRange.end?.replace("T", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetailsClick(log)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded transition-colors flex items-center justify-end ml-auto border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50"
                        title="Ver detalles y scripts SQL"
                      >
                        <span className="material-icons text-sm mr-1">
                          description
                        </span>
                        Ver SQL
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-background/50 px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            Mostrando los últimos {logs.length} registros
          </span>
        </div>
      </div>
    </div>
  );
};
