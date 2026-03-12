// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\components\wizard\WizardStepper.tsx
import React, { useEffect } from "react";

interface WizardStepperProps {
  currentStep: number;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
}) => {
  // Efecto para hacer scroll suave hacia arriba cuando cambia el paso
  useEffect(() => {
    // 1. Intentar scroll en la ventana global
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 2. Buscar y scrollear contenedores internos (ej. <main> o divs con overflow)
    const scrollables = document.querySelectorAll(
      "main, .overflow-y-auto, .overflow-auto",
    );
    scrollables.forEach((el) => {
      // Si el contenedor se ha desplazado hacia abajo, subirlo
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }, [currentStep]);

  const steps = [
    { step: 1, label: "Identificación" },
    { step: 2, label: "Fuente" },
    { step: 3, label: "Ejecución" },
  ];

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-border z-0"></div>
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>
        {steps.map((item) => (
          <div
            key={item.step}
            className="relative z-10 flex flex-col items-center group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background transition-colors duration-300 ${
                currentStep >= item.step
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-text-secondary"
              }`}
            >
              {currentStep > item.step ? (
                <span className="material-icons text-sm">check</span>
              ) : (
                item.step
              )}
            </div>
            <span
              className={`mt-2 text-xs font-semibold uppercase tracking-wider ${
                currentStep >= item.step
                  ? "text-primary"
                  : "text-text-secondary"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
