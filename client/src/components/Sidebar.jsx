import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiBell,
  FiBookOpen,
  FiAward,
  FiFileText,
  FiShield,
  FiSettings,
  FiCheckSquare,
  FiSliders,
  FiActivity
} from 'react-icons/fi';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'employee';

  const getDashboardLink = () => {
    if (role === 'hr_admin') return '/dashboard/hr';
    if (role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <aside className={`app-sidebar ${isMobileOpen ? 'show-mobile' : ''}`}>
      {/* Brand Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
            style={{ width: '36px', height: '36px', backgroundColor: '#4F46E5', fontSize: '1.1rem' }}
          >
            S
          </div>
          <div>
            <span className="brand-font fw-bold fs-5 text-white tracking-tight">StaffSync</span>
            <span className="d-block text-secondary text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              HR Portal
            </span>
          </div>
        </div>
        {isMobileOpen && (
          <button className="btn btn-sm text-white d-lg-none" onClick={closeMobileSidebar}>
            &times;
          </button>
        )}
      </div>

      <div className="py-2">
        {/* Main Dashboard Navigation */}
        <div className="sidebar-heading">Main</div>
        <NavLink
          to={getDashboardLink()}
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiGrid className="fs-5" />
          <span>Dashboard</span>
        </NavLink>

        {/* HR Administrator Navigation */}
        {role === 'hr_admin' && (
          <>
            <div className="sidebar-heading">Organization HR</div>
            <NavLink
              to="/employees"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiUsers className="fs-5" />
              <span>Employees</span>
            </NavLink>
            <NavLink
              to="/departments"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiBriefcase className="fs-5" />
              <span>Departments</span>
            </NavLink>
            <NavLink
              to="/leaves/approvals"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiCheckSquare className="fs-5" />
              <span>Leave Approvals</span>
            </NavLink>
            <NavLink
              to="/leave-policies"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiSliders className="fs-5" />
              <span>Leave Policies</span>
            </NavLink>
            <NavLink
              to="/attendance/reports"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiFileText className="fs-5" />
              <span>Attendance Reports</span>
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiActivity className="fs-5" />
              <span>HR Analytics</span>
            </NavLink>
            <NavLink
              to="/audit-logs"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiShield className="fs-5" />
              <span>Audit Logs</span>
            </NavLink>
          </>
        )}

        {/* Manager Navigation */}
        {role === 'manager' && (
          <>
            <div className="sidebar-heading">Team Management</div>
            <NavLink
              to="/employees?teamOnly=true"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiUsers className="fs-5" />
              <span>My Team</span>
            </NavLink>
            <NavLink
              to="/leaves/approvals"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiCheckSquare className="fs-5" />
              <span>Team Leave Approvals</span>
            </NavLink>
            <NavLink
              to="/attendance/reports"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <FiClock className="fs-5" />
              <span>Team Attendance</span>
            </NavLink>
          </>
        )}

        {/* Self Service & Everyday Tools */}
        <div className="sidebar-heading">Self Service</div>
        <NavLink
          to="/attendance/clock"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiClock className="fs-5" />
          <span>Clock In / Out</span>
        </NavLink>
        <NavLink
          to="/attendance/history"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiFileText className="fs-5" />
          <span>Attendance History</span>
        </NavLink>
        <NavLink
          to="/leaves/apply"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiCalendar className="fs-5" />
          <span>Apply Leave</span>
        </NavLink>
        <NavLink
          to="/trainings"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiBookOpen className="fs-5" />
          <span>Training Programs</span>
        </NavLink>
        <NavLink
          to="/announcements"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiBell className="fs-5" />
          <span>Announcements</span>
        </NavLink>
        <NavLink
          to="/holidays"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiAward className="fs-5" />
          <span>Holidays</span>
        </NavLink>

        {/* Account Settings */}
        <div className="sidebar-heading">Preferences</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          onClick={closeMobileSidebar}
        >
          <FiSettings className="fs-5" />
          <span>Profile & Settings</span>
        </NavLink>
      </div>

      {/* Role Badge Footer */}
      <div className="p-3 mt-auto border-top border-secondary border-opacity-25 text-center">
        <span className="badge bg-secondary bg-opacity-25 text-white py-1 px-2 rounded-pill small">
          Active Role: <strong className="text-info text-capitalize">{role.replace('_', ' ')}</strong>
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;

