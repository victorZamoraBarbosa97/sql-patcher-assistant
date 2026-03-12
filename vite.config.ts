import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    chunkSizeWarningLimit: 1000, // Subimos el límite de aviso a 1MB (opcional)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@amcharts")) {
              return "amcharts"; // Separa la librería de gráficas (es la más pesada)
            }
            if (id.includes("firebase") || id.includes("@firebase")) {
              return "firebase"; // Separa Firebase
            }
            return "vendor"; // El resto (React, Zustand, etc.) va a un archivo "vendor"
          }
        },
      },
    },
  },
});
