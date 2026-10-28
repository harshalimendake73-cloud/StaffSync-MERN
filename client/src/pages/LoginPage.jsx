import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'hr_admin') {
        navigate('/dashboard/hr');
      } else if (user.role === 'manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/employee');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'hr_admin') {
      setEmail('admin@staffsync.com');
      setPassword('StaffSync@2026');
    } else if (role === 'manager') {
      setEmail('manager.eng@staffsync.com');
      setPassword('StaffSync@2026');
    } else if (role === 'employee') {
      setEmail('john.doe@staffsync.com');
      setPassword('StaffSync@2026');
    }
    setError(null);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h4 className="fw-bold text-dark brand-font mb-1">Welcome back</h4>
        <p className="text-muted small">Sign in to access your StaffSync dashboard</p>
      </div>

      {location.search.includes('expired=true') && (
        <div className="alert alert-warning py-2 small" role="alert">
          Your session expired. Please sign in again.
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">Work Email Address</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <FiMail />
            </span>
            <input
              type="email"
              className="form-control bg-light border-start-0"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="form-label small fw-semibold text-secondary mb-0">Password</label>
            <Link to="/forgot-password" className="small text-decoration-none text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <FiLock />
            </span>
            <input
              type="password"
              className="form-control bg-light border-start-0"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to StaffSync</span>
              <FiArrowRight />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Fill Selector */}
      <div className="mt-4 pt-3 border-top">
        <span className="d-block text-muted small text-center mb-2 fw-semibold">
          Demo Quick-Fill Accounts:
        </span>
        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between py-2 px-3"
            onClick={() => fillDemoCredentials('hr_admin')}
          >
            <div>
              <span className="fw-semibold d-block text-dark" style={{ fontSize: '0.8rem' }}>
                HR Administrator
              </span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                admin@staffsync.com
              </span>
            </div>
            <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>Auto-Fill</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between py-2 px-3"
            onClick={() => fillDemoCredentials('manager')}
          >
            <div>
              <span className="fw-semibold d-block text-dark" style={{ fontSize: '0.8rem' }}>
                Engineering Manager
              </span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                manager.eng@staffsync.com
              </span>
            </div>
            <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>Auto-Fill</span>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between py-2 px-3"
            onClick={() => fillDemoCredentials('employee')}
          >
            <div>
              <span className="fw-semibold d-block text-dark" style={{ fontSize: '0.8rem' }}>
                Standard Employee
              </span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                john.doe@staffsync.com
              </span>
            </div>
            <span className="badge bg-secondary text-white" style={{ fontSize: '0.65rem' }}>Auto-Fill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

