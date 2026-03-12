// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\SqlCanvas.tsx
import React from "react";

// Re-exportar el botón para mantener compatibilidad con otros componentes
export { SqlCanvasCopyButton } from "./SqlCanvasCopyButton";

interface SqlCanvasProps {
  title?: string;
  stepIndicator?: string;
  children?: React.ReactNode;
  actionButtons?: React.ReactNode;
  className?: string;
  query?: string | null; // Nueva prop para el string SQL
  autoHeight?: boolean;
}

// Lista de palabras clave SQL comunes
const SQL_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "AND",
  "OR",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "DELETE",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "ON",
  "AS",
  "IN",
  "LIKE",
  "IS",
  "NULL",
  "NOT",
  "GROUP",
  "BY",
  "ORDER",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "CREATE",
  "TABLE",
  "DROP",
  "ALTER",
  "VIEW",
  "UNION",
  "ALL",
  "DISTINCT",
  "EXISTS",
  "BETWEEN",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "CAST",
  "CONVERT",
]);

const SqlHighlighter: React.FC<{ code: string }> = ({ code }) => {
  // Regex para tokenizar: Comentarios | Strings | Números | Puntuación | Espacios
  const regex = /(--.*$|'[^']*'|\b\d+\b|[(),;]|\s+)/gm;

  const parts = code.split(regex);

  return (
    <div className="leading-relaxed whitespace-pre-wrap font-mono text-sm">
      {parts.map((part, i) => {
        if (!part) return null;

        // Determinar el color basado en el tipo de token
        if (part.startsWith("--")) {
          return (
            <span key={i} className="text-gray-500 italic">
              {part}
            </span>
          );
        }
        if (part.startsWith("'")) {
          return (
            <span key={i} className="text-green-400">
              {part}
            </span>
          );
        }
        if (/^\d+$/.test(part)) {
          return (
            <span key={i} className="text-orange-400">
              {part}
            </span>
          );
        }
        if (SQL_KEYWORDS.has(part.toUpperCase())) {
          return (
            <span key={i} className="text-pink-400 font-bold">
              {part}
            </span>
          );
        }
        if (/^[(),;]$/.test(part)) {
          return (
            <span key={i} className="text-gray-400">
              {part}
            </span>
          );
        }
        // Identificadores y otros
        return (
          <span key={i} className="text-gray-300">
            {part}
          </span>
        );
      })}
    </div>
  );
};

export const SqlCanvas: React.FC<SqlCanvasProps> = ({
  title = "SQL Canvas",
  stepIndicator,
  children,
  actionButtons,
  className = "",
  query,
  autoHeight = false,
}) => {
  return (
    <div
      className={`flex flex-col ${autoHeight ? "" : "h-full"} bg-[#0d0e12] rounded-lg border border-gray-800 overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <span className="material-icons text-blue-400 text-sm mr-2">
            code
          </span>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          {stepIndicator && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
              {stepIndicator}
            </span>
          )}
          {actionButtons}
        </div>
      </div>
      <div
        className={`${
          autoHeight
            ? ""
            : "flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        } p-6 font-mono text-sm text-gray-300`}
        style={{
          backgroundImage: "radial-gradient(#1f2937 0.5px, transparent 0.5px)",
          backgroundSize: "20px 20px",
          backgroundColor: "#0d0e12",
        }}
      >
        {query ? <SqlHighlighter code={query} /> : children}
      </div>
    </div>
  );
};
