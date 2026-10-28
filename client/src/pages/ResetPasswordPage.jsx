import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h4 className="fw-bold text-dark brand-font mb-1">Set new password</h4>
        <p className="text-muted small">Choose a strong password for your StaffSync account</p>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {success ? (
        <div className="alert alert-success py-3 text-center small">
          <FiCheckCircle className="text-success fs-3 mb-2" />
          <h6 className="fw-bold mb-1">Password Changed Successfully!</h6>
          <p className="mb-3">You can now sign in with your new credentials.</p>
          <Link to="/login" className="btn btn-primary btn-sm px-4">
            Proceed to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Reset Token</label>
            <input
              type="text"
              className="form-control bg-light"
              placeholder="Paste 64-character token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">New Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <FiLock />
              </span>
              <input
                type="password"
                className="form-control bg-light border-start-0"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <FiLock />
              </span>
              <input
                type="password"
                className="form-control bg-light border-start-0"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mt-2 shadow-sm"
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      <div className="text-center mt-4 pt-3 border-top">
        <Link to="/login" className="small text-decoration-none text-muted">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

