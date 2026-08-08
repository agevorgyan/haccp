import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Guards routes requiring valid authentication.
 * Redirects unauthenticated users to /login and verifies role-based authorization.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && currentUser) {
    const hasRole = allowedRoles.includes(currentUser.role);
    if (!hasRole) {
      // Direct user to their appropriate role home if attempting unauthorized route access
      const defaultPath = currentUser.role === 'STAFF' ? '/staff/dashboard' : '/manager/dashboard';
      return <Navigate to={defaultPath} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
