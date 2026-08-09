import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from './layouts/StaffLayout';
import { ManagerLayout } from './layouts/ManagerLayout';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { TempLogPage } from './pages/staff/TempLogPage';
import { StaffDailyJournalPage } from './pages/staff/StaffDailyJournalPage';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ReportsPage } from './pages/manager/ReportsPage';
import { LanguageManagementPage } from './pages/manager/LanguageManagementPage';
import { UserManagementPage } from './pages/manager/UserManagementPage';
import { HaccpBuilderPage } from './pages/manager/HaccpBuilderPage';
import { LogTemplatesAdminPage } from './pages/manager/LogTemplatesAdminPage';
import { ComplianceDashboardPage } from './pages/manager/ComplianceDashboardPage';
import { CleaningSanitationPage } from './pages/manager/CleaningSanitationPage';
import { SuppliersReceivingPage } from './pages/manager/SuppliersReceivingPage';
import { BatchesManagementPage } from './pages/manager/BatchesManagementPage';
import { IoTMonitoringPage } from './pages/manager/IoTMonitoringPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import { authService } from './services/authService';
import { NotificationProvider } from './context/NotificationContext';

/**
 * Root Redirect Handler
 */
const RootRedirect: React.FC = () => {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = authService.getCurrentUser();
  const role = currentUser?.role?.toUpperCase();
  if (role === 'MANAGER' || role === 'OWNER' || role === 'SUPER_ADMIN') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/staff/dashboard" replace />;
};

/**
 * App Component
 */
export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dynamic Root Route */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Staff Layout Group */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF', 'MANAGER', 'OWNER', 'SUPER_ADMIN']} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="journal" element={<StaffDailyJournalPage />} />
              <Route path="cleaning" element={<CleaningSanitationPage />} />
              <Route path="temp-check" element={<TempLogPage />} />
              <Route path="logs" element={<StaffDashboard />} />
              <Route path="incidents" element={<StaffDashboard />} />
            </Route>
          </Route>

          {/* Protected Manager Layout Group */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'OWNER', 'SUPER_ADMIN']} />}>
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="haccp" element={<HaccpBuilderPage />} />
              <Route path="templates" element={<LogTemplatesAdminPage />} />
              <Route path="compliance" element={<ComplianceDashboardPage />} />
              <Route path="cleaning" element={<CleaningSanitationPage />} />
              <Route path="suppliers" element={<SuppliersReceivingPage />} />
              <Route path="traceability/batches" element={<BatchesManagementPage />} />
              <Route path="iot-sensors" element={<IoTMonitoringPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="equipment" element={<ManagerDashboard />} />
              <Route path="locations" element={<ManagerDashboard />} />
              <Route path="languages" element={<LanguageManagementPage />} />
              <Route path="settings" element={<ManagerDashboard />} />
            </Route>
          </Route>

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;
