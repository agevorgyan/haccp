import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from './layouts/StaffLayout';
import { ManagerLayout } from './layouts/ManagerLayout';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { TempLogPage } from './pages/staff/TempLogPage';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ReportsPage } from './pages/manager/ReportsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { authService } from './services/authService';

/**
 * Root Redirect Handler
 * Dynamically routes user to /login if unauthenticated, or to their role dashboard if authenticated.
 */
const RootRedirect: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = authService.getCurrentUser();
  if (currentUser?.role === 'MANAGER' || currentUser?.role === 'OWNER') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/staff/dashboard" replace />;
};

/**
 * App Component - Foundational Routing Architecture with Role-Based Route Protection
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dynamic Root Route */}
        <Route path="/" element={<RootRedirect />} />

        {/* Protected Staff Layout Group (Mobile Kitchen Interface) */}
        <Route element={<ProtectedRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER']} />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="temp-check" element={<TempLogPage />} />
            <Route path="logs" element={<StaffDashboard />} />
            <Route path="incidents" element={<StaffDashboard />} />
          </Route>
        </Route>

        {/* Protected Manager Layout Group (Desktop Administrative Cockpit) */}
        <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'OWNER']} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="equipment" element={<ManagerDashboard />} />
            <Route path="locations" element={<ManagerDashboard />} />
            <Route path="settings" element={<ManagerDashboard />} />
          </Route>
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
