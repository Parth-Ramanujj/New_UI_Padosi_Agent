import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRouteSkeleton from '@/components/skeletons/ProtectedRouteSkeleton';

type UserRole = 'user' | 'agent' | 'distributor' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

// Map roles to their respective dashboard routes
const roleDashboardMap: Record<UserRole, string> = {
  user: '/client-dashboard',
  agent: '/agent-dashboard',
  distributor: '/distributor-dashboard',
  admin: '/admin',
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <ProtectedRouteSkeleton />;
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User doesn't have required role - redirect to their appropriate dashboard
    const correctDashboard = roleDashboardMap[user.role];
    
    // Prevent redirect loop - if already on their dashboard, go home
    if (location.pathname === correctDashboard) {
      return <Navigate to="/" replace />;
    }
    
    return <Navigate to={correctDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
