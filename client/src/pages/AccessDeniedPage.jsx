import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiArrowLeft } from 'react-icons/fi';

const AccessDeniedPage = () => {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === 'hr_admin') return '/dashboard/hr';
    if (user?.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <div className="container text-center py-5">
      <div className="card-saas p-5 mx-auto shadow-sm" style={{ maxWidth: '520px' }}>
        <div
          className="stat-icon-wrapper mx-auto mb-3"
          style={{ width: '64px', height: '64px', backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '2rem' }}
        >
          <FiShield />
        </div>
        <h3 className="fw-bold brand-font text-dark mb-2">403 — Access Denied</h3>
        <p className="text-muted small mb-4">
          You do not possess the required authorization credentials to access this administrative resource.
          Your current access role is: <strong className="text-dark text-capitalize">{user?.role?.replace('_', ' ') || 'Guest'}</strong>.
        </p>
        <Link to={getDashboardPath()} className="btn btn-primary d-inline-flex align-items-center gap-2">
          <FiArrowLeft /> Return to Authorized Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDeniedPage;

