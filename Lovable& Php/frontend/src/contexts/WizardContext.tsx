import React, { createContext, useContext, useState, ReactNode } from "react";
import FindAgentWizard from "@/components/FindAgentWizard";
import MobileFilterSheet, { type CoverType } from "@/components/MobileFilterSheet";
import { useIsMobile } from "@/hooks/use-mobile";

type ServiceType = "new-policy" | "transfer-renew" | "claim" | "policy-review";

interface WizardContextType {
  openWizard: (defaultService?: ServiceType, defaultInsuranceType?: string) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    return { openWizard: () => console.warn("useWizard used outside WizardProvider") };
  }
  return ctx;
};

const isCoverType = (v?: string): v is CoverType =>
  v === "health" || v === "life" || v === "motor" || v === "sme";

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [state, setState] = useState<{
    open: boolean;
    defaultService?: ServiceType;
    defaultInsuranceType?: string;
  }>({ open: false });

  const openWizard = (defaultService?: ServiceType, defaultInsuranceType?: string) => {
    setState({ open: true, defaultService, defaultInsuranceType });
  };

  const closeWizard = () => setState({ open: false });

  return (
    <WizardContext.Provider value={{ openWizard }}>
      {children}
      {isMobile ? (
        <MobileFilterSheet
          open={state.open}
          onClose={closeWizard}
          lockService={state.defaultService}
          lockCover={isCoverType(state.defaultInsuranceType) ? state.defaultInsuranceType : undefined}
        />
      ) : (
        <FindAgentWizard
          open={state.open}
          onClose={closeWizard}
          defaultService={state.defaultService}
          defaultInsuranceType={state.defaultInsuranceType}
        />
      )}
    </WizardContext.Provider>
  );
};
