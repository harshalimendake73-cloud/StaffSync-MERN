import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center py-5" style={{ backgroundColor: '#0F172A' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold text-white shadow"
              style={{ width: '42px', height: '42px', backgroundColor: '#4F46E5', fontSize: '1.25rem' }}
            >
              S
            </div>
            <span className="brand-font fw-bold fs-3 text-white">StaffSync</span>
          </Link>
          <p className="text-secondary small mb-0">People First. Work Smarter.</p>
        </div>

        <div className="card-saas p-4 p-sm-5 shadow-lg border-0 bg-white">
          <Outlet />
        </div>

        <div className="text-center mt-4 text-secondary small">
          StaffSync Enterprise HR Platform &bull; Secure Encrypted Session
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

