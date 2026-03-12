import React from "react";

export interface DeviceInfoCardProps {
  title: string;
  deviceId?: string | number | null;
  deviceAlias?: string | null;
  ip?: string | null;
  interfaceName?: string | null;
  statsId?: string | number | null;
  variant?: "target" | "source";
  className?: string;
}

export const DeviceInfoCard: React.FC<DeviceInfoCardProps> = ({
  title,
  deviceId,
  deviceAlias,
  ip,
  interfaceName,
  statsId,
  variant = "target",
  className = "",
}) => {
  const isTarget = variant === "target";

  // Estilos dinámicos según si es Receptor (azul) o Donador (naranja)
  const containerStyles = isTarget
    ? "bg-blue-500/10 border-blue-500/20"
    : "bg-orange-500/10 border-orange-500/20";

  const iconBgStyles = isTarget ? "bg-blue-500/20" : "bg-orange-500/20";

  const textStyles = isTarget ? "text-blue-400" : "text-orange-400";

  const iconName = isTarget ? "bookmark_added" : "content_copy";

  return (
    <div
      className={`animate-in fade-in slide-in-from-top-4 duration-300 ${className}`}
    >
      <div
        className={`${containerStyles} border rounded-lg p-4 flex items-start space-x-4`}
      >
        <div className={`p-2 ${iconBgStyles} rounded-full shrink-0`}>
          <span className={`material-icons ${textStyles}`}>{iconName}</span>
        </div>
        <div className="flex-1">
          <h4
            className={`text-sm font-bold ${textStyles} uppercase tracking-wider mb-2`}
          >
            {title}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <span className="text-[10px] text-text-secondary uppercase block">
                Dispositivo ID
              </span>
              <span className="text-sm font-mono text-text-main">
                {String(deviceId || "N/A")}
              </span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-[10px] text-text-secondary uppercase block">
                Alias
              </span>
              <span
                className="text-sm font-mono text-text-main block wrap-break-word"
                title={String(deviceAlias || "N/A")}
              >
                {String(deviceAlias || "N/A")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block">
                IP
              </span>
              <span className="text-sm font-mono text-text-main">
                {String(ip || "N/A")}
              </span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="text-[10px] text-text-secondary uppercase block">
                Interfaz
              </span>
              <span
                className="text-sm font-mono text-text-main block wrap-break-word"
                title={String(interfaceName || "N/A")}
              >
                {String(interfaceName || "N/A")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-text-secondary uppercase block">
                Stats ID
              </span>
              <span className="text-sm font-mono text-text-main">
                {String(statsId || "N/A")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
