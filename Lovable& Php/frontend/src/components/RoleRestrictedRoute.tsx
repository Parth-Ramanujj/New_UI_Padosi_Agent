import React from 'react';

interface RoleRestrictedRouteProps {
  children: React.ReactNode;
}

const RoleRestrictedRoute: React.FC<RoleRestrictedRouteProps> = ({ children }) => {
  // We no longer restrict agents/distributors from viewing public pages like home, FAQ, agents listing, etc.
  // Protected dashboards are handled independently by ProtectedRoute.
  return <>{children}</>;
};

export default RoleRestrictedRoute;
