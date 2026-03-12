// d:\chato\Documents\WORK\_SISTEMAS WEB SERVER APP\SISTEMAS-WEB-APP\src\pages\SisproDataPatcher.tsx
import { WizardStepper } from "../components/wizard/WizardStepper";
import { StepTarget } from "../components/wizard/StepTarget";
import { StepSource } from "../components/wizard/StepSource";
import { StepExecution } from "../components/wizard/StepExecution";
import { useWizardStore } from "../store/wizardStore";

export const SisproDataPatcher = () => {
  const currentStep = useWizardStore((state) => state.currentStep);

  return (
    <div className="max-w-8xl mx-auto">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
      <div className="mb-1 text-center">
        <h1 className="text-4xl font-bold text-text-main mb-0 tracking-tight">
          SISPRO Data Patcher
        </h1>
        <p className="text-text-secondary">
          Asistente de Inserción de Históricos de Red
        </p>
      </div>

      <WizardStepper currentStep={currentStep} />

      <div key={currentStep} className="animate-fade-in-up">
        {currentStep === 1 && <StepTarget />}
        {currentStep === 2 && <StepSource />}
        {currentStep === 3 && <StepExecution />}
      </div>
    </div>
  );
};
