import React from "react";

interface SqlDisplayProps {
  sql: string;
  onCopy: () => void;
}

export const SqlDisplay: React.FC<SqlDisplayProps> = ({ sql, onCopy }) => {
  if (!sql) return null;

  return (
    <div className="mt-8 bg-card shadow-soft dark:shadow-none rounded-lg border border-border overflow-hidden transition-colors duration-200">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
        <h3 className="text-lg font-medium leading-6 text-text-main">
          Queries Generadas
        </h3>
        <button
          onClick={onCopy}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Copiar SQL
          <span className="material-icons ml-1 text-xs">content_copy</span>
        </button>
      </div>
      <div className="p-0">
        <pre className="bg-gray-50 dark:bg-slate-900 text-accent p-6 overflow-x-auto text-sm font-mono leading-relaxed">
          {sql}
        </pre>
      </div>
    </div>
  );
};
