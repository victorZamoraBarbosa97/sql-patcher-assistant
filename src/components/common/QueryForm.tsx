import React from "react";

interface FormData {
  statsId: string;
  interfaceId: string;
  fechaInicio: string;
  fechaFin: string;
}

interface QueryFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
}

export const QueryForm: React.FC<QueryFormProps> = ({
  formData,
  onChange,
  onGenerate,
}) => {
  return (
    <div className="bg-card shadow-soft dark:shadow-none rounded-lg border border-border overflow-hidden mb-8 transition-colors duration-200">
      <div className="p-6 md:p-8 space-y-6">
        {/* Row 1: Source ID & Date Range 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              htmlFor="statsId"
            >
              Source Interface ID
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="statsId"
                id="statsId"
                value={formData.statsId}
                onChange={onChange}
                className="block w-full rounded-md border-border bg-input text-text-main focus:border-primary focus:ring-primary sm:text-sm h-12 px-4 placeholder-text-secondary/50 transition-colors"
                placeholder="00885"
              />
            </div>
          </div>
          <div className="md:col-span-7">
            <label
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              htmlFor="fechaInicio"
            >
              Date Range
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="datetime-local"
                name="fechaInicio"
                id="fechaInicio"
                value={formData.fechaInicio}
                onChange={onChange}
                placeholder="dd/mm/aaaa --:-- -----"
                className="block w-full rounded-md border-border bg-input text-text-main focus:border-primary focus:ring-primary sm:text-sm h-12 px-4 font-mono tracking-wide transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border"></div>

        {/* Row 2: Target ID & Date Range 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              htmlFor="interfaceId"
            >
              Target Interface ID
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="interfaceId"
                id="interfaceId"
                value={formData.interfaceId}
                onChange={onChange}
                className="block w-full rounded-md border-border bg-input text-text-main focus:border-primary focus:ring-primary sm:text-sm h-12 px-4 placeholder-text-secondary/50 transition-colors"
                placeholder="41754"
              />
            </div>
          </div>
          <div className="md:col-span-7">
            <label
              className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1"
              htmlFor="fechaFin"
            >
              Target Date Range
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="datetime-local"
                name="fechaFin"
                id="fechaFin"
                value={formData.fechaFin}
                onChange={onChange}
                placeholder="dd/mm/aaaa --:-- -----"
                className="block w-full rounded-md border-border bg-input text-text-main focus:border-primary focus:ring-primary sm:text-sm h-12 px-4 font-mono tracking-wide transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800/30 transition-colors">
          <div className="flex">
            <div className="shrink-0">
              <span className="material-icons text-primary text-sm mt-0.5">
                info
              </span>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Las queries generadas incluirán bloqueos de transacción
                automáticos.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background/50 px-6 py-4 flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between border-t border-border transition-colors">
        <button
          type="button"
          onClick={onGenerate}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
        >
          Generar queries de recuperación
          <span className="material-icons ml-2 text-sm">code</span>
        </button>
        <p className="mt-2 sm:mt-0 text-xs text-text-secondary flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Sistema Online v2.4.1
        </p>
      </div>
    </div>
  );
};
