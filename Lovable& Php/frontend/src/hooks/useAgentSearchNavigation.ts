import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAgentSearchNavigationOptions {
  path?: string;
  scrollToTop?: boolean;
}

export function useAgentSearchNavigation(options: UseAgentSearchNavigationOptions = {}) {
  const { path = '/Agents', scrollToTop = true } = options;
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  const navigateWithLoader = useCallback((customPath?: string) => {
    setShowLoader(true);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return {
      targetPath: customPath || path,
    };
  }, [path, scrollToTop]);

  const handleLoaderComplete = useCallback((targetPath: string) => {
    setShowLoader(false);
    navigate(targetPath);
  }, [navigate]);

  return {
    showLoader,
    setShowLoader,
    navigateWithLoader,
    handleLoaderComplete,
  };
}
