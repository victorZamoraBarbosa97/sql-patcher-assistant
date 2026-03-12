// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\target\ValidationResults.tsx
import React from "react";
import { SqlCanvas, SqlCanvasCopyButton } from "../../ui/SqlCanvas";
import { SqlTable } from "../../ui/SqlTable";
import { DeviceInfoCard } from "../../ui/DeviceInfoCard";

interface ValidationResultsProps {
  identificationQuery: string | null;
  results: Record<string, unknown>[];
  selectedRow: Record<string, unknown> | null;
  selectedRowIndex: number | null;
  onRowSelect: (row: Record<string, unknown>, index: number) => void;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  identificationQuery,
  results,
  selectedRow,
  selectedRowIndex,
  onRowSelect,
}) => {
  return (
    <>
      {/* Área de Canvas Dividida */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        {/* Lado Izquierdo: SQL */}
        <div className="h-full">
          <SqlCanvas
            stepIndicator="Query SQL"
            query={
              identificationQuery
                ? `-- Query de Identificación\n${identificationQuery}`
                : null
            }
            actionButtons={
              identificationQuery && (
                <SqlCanvasCopyButton text={identificationQuery} />
              )
            }
          >
            {!identificationQuery && (
              <div className="text-gray-500 italic text-xs flex flex-col items-center justify-center h-full">
                <span className="material-icons text-4xl mb-2 opacity-20">
                  terminal
                </span>
                <p>Genere la query para ver el código SQL.</p>
              </div>
            )}
          </SqlCanvas>
        </div>

        {/* Lado Derecho: Resultados Tabla SQL */}
        <div className="h-full">
          <SqlTable
            title="Registros en BD"
            data={results}
            onRowClick={onRowSelect}
            selectedIndex={selectedRowIndex}
          />
        </div>
      </div>

      {/* Feedback de Selección de Target */}
      {selectedRow && (
        <DeviceInfoCard
          className="mt-9"
          title="Receptor Seleccionado (Target)"
          variant="target"
          deviceId={selectedRow.DEVICE_ID as string | number}
          deviceAlias={selectedRow.DEVICE_ALIAS as string}
          ip={selectedRow.IP as string}
          interfaceName={
            (selectedRow.INTERFACE_NAME || selectedRow.ALIAS) as string
          }
          statsId={selectedRow.STATSTABLEID as string | number}
        />
      )}
    </>
  );
};
