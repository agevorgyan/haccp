import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from './layouts/StaffLayout';
import { ManagerLayout } from './layouts/ManagerLayout';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { TempLogPage } from './pages/staff/TempLogPage';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { ReportsPage } from './pages/manager/ReportsPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * App Component - Foundational Routing Architecture
 * Establishes two distinct operational contexts:
 * 1. /staff: Mobile-first kitchen workflow (rapid data entry, offline support, touch targets)
 * 2. /manager: Desktop/tablet administrative cockpit (analytics, audit compliance, PDF export)
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect: Default to Kitchen Staff View for immediate operational entry */}
        <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />

        {/* Staff Layout Group (Mobile Kitchen Interface) */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="temp-check" element={<TempLogPage />} />
          <Route path="logs" element={<StaffDashboard />} />
          <Route path="incidents" element={<StaffDashboard />} />
        </Route>

        {/* Manager Layout Group (Desktop Administrative Cockpit) */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="equipment" element={<ManagerDashboard />} />
          <Route path="locations" element={<ManagerDashboard />} />
          <Route path="settings" element={<ManagerDashboard />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
