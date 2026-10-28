import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [resetTokenData, setResetTokenData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'Instructions sent to your email.');
      if (res.data.resetToken) {
        setResetTokenData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-4">
        <h4 className="fw-bold text-dark brand-font mb-1">Reset your password</h4>
        <p className="text-muted small">
          Enter your registered work email to receive password reset instructions.
        </p>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {success && (
        <div className="alert alert-success py-3 small">
          <div className="d-flex align-items-center gap-2 mb-2 fw-semibold">
            <FiCheckCircle className="text-success fs-5" /> Request Processed
          </div>
          <p className="mb-2">{success}</p>
          {resetTokenData && (
            <div className="mt-3 p-2 bg-white rounded border">
              <span className="fw-bold d-block text-dark small mb-1">Development Demo Token:</span>
              <code className="text-break small d-block mb-2">{resetTokenData.resetToken}</code>
              <Link
                to={`/reset-password?token=${resetTokenData.resetToken}`}
                className="btn btn-sm btn-primary w-100"
              >
                Proceed to Reset Password Page
              </Link>
            </div>
          )}
        </div>
      )}

      {!resetTokenData && (
        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 mt-2 shadow-sm"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Send Reset Instructions'}
          </button>
        </form>
      )}

      <div className="text-center mt-4 pt-3 border-top">
        <Link to="/login" className="small text-decoration-none text-muted d-inline-flex align-items-center gap-1">
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

