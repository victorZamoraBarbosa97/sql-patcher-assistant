// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\ui\SqlTable.tsx
import React from "react";

interface SqlTableProps {
  data: Record<string, unknown>[];
  title?: string;
  className?: string;
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
  selectedIndex?: number | null;
}

export const SqlTable: React.FC<SqlTableProps> = ({
  data,
  title = "Resultados",
  className = "",
  onRowClick,
  selectedIndex,
}) => {
  // Verificamos si hay datos válidos para mostrar
  const hasData = data && Array.isArray(data) && data.length > 0;
  // Extraemos las columnas del primer objeto si existen datos
  const columns = hasData ? Object.keys(data[0]) : [];

  return (
    <div
      className={`flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden ${className}`}
    >
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-b border-border shrink-0">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-blue-400 text-sm">
            table_chart
          </span>
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {title}
          </span>
        </div>
        <span className="text-[10px] text-text-secondary font-mono">
          {hasData ? `${data.length} registros` : "0 registros"}
        </span>
      </div>

      {/* Cuerpo de la Tabla con Scroll */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-card">
        {hasData ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-background sticky top-0 z-10 shadow-sm">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-r border-border last:border-r-0 whitespace-nowrap bg-background"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  className={`transition-colors group cursor-pointer ${selectedIndex === rowIndex ? "bg-primary/20 border-l-2 border-primary" : "hover:bg-primary/5 border-l-2 border-transparent"}`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="px-3 py-1.5 text-xs text-text-main font-mono border-r border-border last:border-r-0 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"
                      title={String(row[col])}
                    >
                      {row[col] === null ? (
                        <span className="text-text-secondary italic">NULL</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary italic text-xs">
            <span className="material-icons text-3xl mb-2 opacity-20">
              table_rows
            </span>
            <p>Sin datos para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
};
