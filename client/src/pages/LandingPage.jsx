import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBookOpen,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiTrendingUp,
  FiAward
} from 'react-icons/fi';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardPath = () => {
    if (user?.role === 'hr_admin') return '/dashboard/hr';
    if (user?.role === 'manager') return '/dashboard/manager';
    return '/dashboard/employee';
  };

  return (
    <div className="bg-white min-vh-100 d-flex flex-column">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
              style={{ width: '38px', height: '38px', backgroundColor: '#4F46E5', fontSize: '1.2rem' }}
            >
              S
            </div>
            <span className="brand-font fw-bold fs-4 text-dark">StaffSync</span>
          </Link>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn btn-primary d-flex align-items-center gap-2">
                Go to Dashboard <FiArrowRight />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary d-flex align-items-center gap-2 px-4">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 py-lg-6" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="container text-center py-4">
          <span className="badge rounded-pill bg-indigo-subtle text-primary px-3 py-2 fw-semibold mb-3 border border-primary border-opacity-25">
            Enterprise People Operations Platform
          </span>
          <h1 className="display-4 fw-extrabold text-dark brand-font mb-3 mx-auto" style={{ maxWidth: '820px', lineHeight: 1.15 }}>
            People First. <span className="text-primary">Work Smarter.</span>
          </h1>
          <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '640px' }}>
            StaffSync streamlines attendance tracking, automated leave management, role-based workflows, and employee engagement in one unified, high-performance portal.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link to="/login" className="btn btn-primary btn-lg px-4 py-3 shadow-sm d-flex align-items-center gap-2">
              Launch Live Portal <FiArrowRight />
            </Link>
            <a href="#features" className="btn btn-outline-secondary btn-lg px-4 py-3">
              Explore Modules
            </a>
          </div>

          {/* SaaS Metrics Highlights */}
          <div className="row g-4 justify-content-center text-center mt-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="col-6 col-md-3">
              <div className="card-saas p-3">
                <h3 className="fw-bold text-primary mb-1">99.9%</h3>
                <span className="text-muted small">Attendance Accuracy</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-saas p-3">
                <h3 className="fw-bold text-primary mb-1">100%</h3>
                <span className="text-muted small">Automated Balance</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-saas p-3">
                <h3 className="fw-bold text-primary mb-1">3 Roles</h3>
                <span className="text-muted small">HR, Manager, Employee</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card-saas p-3">
                <h3 className="fw-bold text-primary mb-1">Zero</h3>
                <span className="text-muted small">Duplicate Check-Ins</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Modules Grid */}
      <section id="features" className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark brand-font">Built For Modern Enterprise Teams</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '580px' }}>
              Engineered with precision to reduce administrative friction and empower team productivity.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                  <FiClock />
                </div>
                <h5 className="fw-bold mb-2">Smart Attendance & Shifts</h5>
                <p className="text-muted small mb-0">
                  Single session per workday enforcement, live elapsed timer, late-arrival calculation, overnight shift support, and exportable CSV audit records.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <FiCalendar />
                </div>
                <h5 className="fw-bold mb-2">Automated Leave Engine</h5>
                <p className="text-muted small mb-0">
                  Casual, sick, earned, and unpaid buckets. Real-time balance deductions, overlapping date prevention, manager approvals, and cancellation handling.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                  <FiUsers />
                </div>
                <h5 className="fw-bold mb-2">Role-Based Access Control</h5>
                <p className="text-muted small mb-0">
                  Dedicated operational dashboards for HR Admins, Department Managers, and Employees with strict authorization boundaries.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  <FiBookOpen />
                </div>
                <h5 className="fw-bold mb-2">Upskilling & Training</h5>
                <p className="text-muted small mb-0">
                  Program catalog, capacity enforcement, progress percentage tracking, and completion credentials for continuous professional growth.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                  <FiTrendingUp />
                </div>
                <h5 className="fw-bold mb-2">HR Analytics & Reports</h5>
                <p className="text-muted small mb-0">
                  Real-time workforce distribution charts, attendance trends, departmental headcounts, and downloadable compliance summaries.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-saas p-4 h-100">
                <div className="stat-icon-wrapper mb-3" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  <FiShield />
                </div>
                <h5 className="fw-bold mb-2">Enterprise Security & Auditing</h5>
                <p className="text-muted small mb-0">
                  JWT authentication, bcrypt credential hashing, express-rate-limit protection, Helmet headers, and immutable audit logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-5 text-white text-center mt-auto" style={{ backgroundColor: '#0F172A' }}>
        <div className="container py-4">
          <h2 className="fw-bold mb-3 brand-font">Ready to elevate your workforce management?</h2>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '520px' }}>
            Experience the complete StaffSync system with pre-seeded enterprise HR demo accounts.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg px-4 py-3 shadow">
            Sign In with Demo Credentials <FiArrowRight className="ms-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

