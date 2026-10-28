import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

import HRDashboardPage from '../pages/HRDashboardPage';
import ManagerDashboardPage from '../pages/ManagerDashboardPage';
import EmployeeDashboardPage from '../pages/EmployeeDashboardPage';

import EmployeeDirectoryPage from '../pages/EmployeeDirectoryPage';
import AddEditEmployeePage from '../pages/AddEditEmployeePage';
import EmployeeProfilePage from '../pages/EmployeeProfilePage';
import DepartmentManagementPage from '../pages/DepartmentManagementPage';

import LeaveApplicationPage from '../pages/LeaveApplicationPage';
import LeaveApprovalPage from '../pages/LeaveApprovalPage';
import LeavePolicyPage from '../pages/LeavePolicyPage';

import AttendanceClockPage from '../pages/AttendanceClockPage';
import AttendanceHistoryPage from '../pages/AttendanceHistoryPage';
import AttendanceReportsPage from '../pages/AttendanceReportsPage';

import AnnouncementsPage from '../pages/AnnouncementsPage';
import TrainingManagementPage from '../pages/TrainingManagementPage';
import TrainingEnrollmentPage from '../pages/TrainingEnrollmentPage';
import HolidayManagementPage from '../pages/HolidayManagementPage';

import ReportsAnalyticsPage from '../pages/ReportsAnalyticsPage';
import SettingsProfilePage from '../pages/SettingsProfilePage';
import NotificationsPage from '../pages/NotificationsPage';
import AuditLogsPage from '../pages/AuditLogsPage';

import AccessDeniedPage from '../pages/AccessDeniedPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Authenticated Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboards */}
        <Route
          path="/dashboard/hr"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <HRDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/manager"
          element={
            <RoleRoute allowedRoles={['manager', 'hr_admin']}>
              <ManagerDashboardPage />
            </RoleRoute>
          }
        />
        <Route path="/dashboard/employee" element={<EmployeeDashboardPage />} />

        {/* Employees */}
        <Route path="/employees" element={<EmployeeDirectoryPage />} />
        <Route
          path="/employees/new"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <AddEditEmployeePage />
            </RoleRoute>
          }
        />
        <Route
          path="/employees/:id/edit"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <AddEditEmployeePage />
            </RoleRoute>
          }
        />
        <Route path="/employees/:id" element={<EmployeeProfilePage />} />

        {/* Departments */}
        <Route path="/departments" element={<DepartmentManagementPage />} />

        {/* Leaves */}
        <Route path="/leaves/apply" element={<LeaveApplicationPage />} />
        <Route
          path="/leaves/approvals"
          element={
            <RoleRoute allowedRoles={['manager', 'hr_admin']}>
              <LeaveApprovalPage />
            </RoleRoute>
          }
        />
        <Route
          path="/leave-policies"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <LeavePolicyPage />
            </RoleRoute>
          }
        />

        {/* Attendance */}
        <Route path="/attendance/clock" element={<AttendanceClockPage />} />
        <Route path="/attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="/attendance/reports" element={<AttendanceReportsPage />} />

        {/* Announcements & Training */}
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/trainings" element={<TrainingManagementPage />} />
        <Route path="/trainings/enrollments" element={<TrainingEnrollmentPage />} />
        <Route path="/holidays" element={<HolidayManagementPage />} />

        {/* Analytics, Settings & Audit */}
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <ReportsAnalyticsPage />
            </RoleRoute>
          }
        />
        <Route path="/settings" element={<SettingsProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/audit-logs"
          element={
            <RoleRoute allowedRoles={['hr_admin']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />

        <Route path="/403" element={<AccessDeniedPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;

