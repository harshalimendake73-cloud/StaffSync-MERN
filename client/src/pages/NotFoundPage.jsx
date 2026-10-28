import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="container text-center py-5">
      <div className="card-saas p-5 mx-auto shadow-sm" style={{ maxWidth: '480px' }}>
        <div
          className="stat-icon-wrapper mx-auto mb-3"
          style={{ width: '64px', height: '64px', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '2rem' }}
        >
          <FiAlertCircle />
        </div>
        <h3 className="fw-bold brand-font text-dark mb-2">404 — Page Not Found</h3>
        <p className="text-muted small mb-4">
          The StaffSync resource or endpoint you requested does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <FiArrowLeft /> Return to StaffSync Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

