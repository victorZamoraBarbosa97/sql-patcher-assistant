import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  toggleTheme: () => void;
}

// Definir elementos de menú fuera del componente para evitar recreación en cada render
const MENU_ITEMS = [
  {
    path: "/",
    name: "SISPRO Data Patcher",
    icon: "handyman",
  },
  { path: "/cleaner", name: "Limpieza de Logs", icon: "cleaning_services" },
  { path: "/history", name: "Histórico de movimientos", icon: "history" },
];

export const Sidebar: React.FC<SidebarProps> = ({ toggleTheme }) => {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full transition-colors duration-200 shadow-soft z-10">
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-border bg-background/50 backdrop-blur-sm">
        <span className="material-icons text-primary mr-3 text-2xl">
          admin_panel_settings
        </span>
        <span className="text-sm font-bold text-text-main uppercase tracking-wider leading-tight">
          Herramientas <br /> Sistemas GDC
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-text-secondary hover:bg-background hover:text-text-main hover:shadow-sm"
              }`
            }
          >
            <span className="material-icons mr-3 text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {item.icon}
            </span>
            <span className="font-medium text-sm tracking-wide">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-border bg-background/30">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-text-secondary bg-card hover:bg-background hover:text-primary rounded-lg transition-all duration-200 border border-border shadow-sm hover:shadow group"
        >
          <span className="material-icons mr-2 text-lg group-hover:rotate-180 transition-transform duration-500">
            brightness_6
          </span>
          <span>Cambiar Tema</span>
        </button>
        <div className="mt-4 text-xs text-center text-text-secondary/60">
          v1.0 Stable
        </div>
      </div>
    </div>
  );
};
