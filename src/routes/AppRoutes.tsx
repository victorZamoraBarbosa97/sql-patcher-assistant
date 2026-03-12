import { Routes, Route } from "react-router-dom";
import { SisproDataPatcher } from "../pages/SisproDataPatcher";
import { RecentActivity } from "../pages/RecentActivity";

// Componentes "Placeholder" para tus herramientas
const CleanerScript = () => (
  <div className=" dark:text-white">
    <h2 className="text-text-main text-2xl font-bold">
      🧹 Script: Limpieza de Logs
    </h2>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SisproDataPatcher />} />
      <Route path="/cleaner" element={<CleanerScript />} />
      <Route path="/history" element={<RecentActivity />} />
    </Routes>
  );
};
