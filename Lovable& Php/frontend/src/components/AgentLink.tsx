import React from 'react';
import { useAgentSearchNavigation } from '@/contexts/AgentSearchContext';

interface AgentLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * A link component that shows the agent search loader before navigating to /agents pages
 */
const AgentLink: React.FC<AgentLinkProps> = ({ to, children, className, onClick }) => {
  const { navigateWithLoader } = useAgentSearchNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigateWithLoader(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default AgentLink;
