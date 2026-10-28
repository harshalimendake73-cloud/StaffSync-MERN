import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1030 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="app-main flex-grow-1">
        <TopNavbar toggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="p-3 p-lg-4 flex-grow-1">
          <Outlet />
        </main>
        <footer className="p-3 text-center text-muted small border-top bg-white">
          &copy; {new Date().getFullYear()} StaffSync &bull; People First. Work Smarter.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

