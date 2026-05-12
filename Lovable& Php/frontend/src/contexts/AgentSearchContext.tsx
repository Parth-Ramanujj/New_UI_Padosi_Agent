import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgentSearchContextType {
  navigateWithLoader: (path: string) => void;
}

const AgentSearchContext = createContext<AgentSearchContextType | null>(null);

export const useAgentSearchNavigation = () => {
  const context = useContext(AgentSearchContext);
  if (!context) {
    // Fallback: return a no-op function instead of throwing
    return {
      navigateWithLoader: (_path: string) => {
        console.warn('useAgentSearchNavigation used outside AgentSearchProvider');
      }
    };
  }
  return context;
};

interface AgentSearchProviderProps {
  children: ReactNode;
}

export const AgentSearchProvider: React.FC<AgentSearchProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const navigateWithLoader = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <AgentSearchContext.Provider value={{ navigateWithLoader }}>
      {children}
    </AgentSearchContext.Provider>
  );
};
