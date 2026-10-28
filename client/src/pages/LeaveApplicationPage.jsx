import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';
import { FiCalendar, FiPlus, FiAlertCircle, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';

const LeaveApplicationPage = () => {
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, leaveRes] = await Promise.all([
        apiClient.get('/leaves/balance/me'),
        apiClient.get('/leaves?limit=50')
      ]);
      setBalance(balRes.data.data);
      setLeaves(leaveRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post('/leaves', formData);
      setSuccess('Leave application submitted successfully for review.');
      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      await apiClient.patch(`/leaves/${id}/cancel`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Leave Application & Balances</h3>
          <p className="text-muted small mb-0">
            Request time off, monitor available quota balances, and track review status.
          </p>
        </div>
      </div>

      {/* 4 Balance Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-saas p-3 border-start border-4 border-primary">
            <span className="text-muted small fw-semibold text-uppercase">Casual Leave</span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h3 className="fw-bold text-dark mb-0">
                {(balance?.casual?.total || 12) - (balance?.casual?.used || 0)}
              </h3>
              <span className="text-muted small">days remaining</span>
            </div>
            <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
              Used: {balance?.casual?.used || 0} &bull; Pending: {balance?.casual?.pending || 0}
            </span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card-saas p-3 border-start border-4 border-success">
            <span className="text-muted small fw-semibold text-uppercase">Sick / Medical</span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h3 className="fw-bold text-dark mb-0">
                {(balance?.sick?.total || 10) - (balance?.sick?.used || 0)}
              </h3>
              <span className="text-muted small">days remaining</span>
            </div>
            <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
              Used: {balance?.sick?.used || 0} &bull; Pending: {balance?.sick?.pending || 0}
            </span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card-saas p-3 border-start border-4 border-info">
            <span className="text-muted small fw-semibold text-uppercase">Earned Vacation</span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h3 className="fw-bold text-dark mb-0">
                {(balance?.earned?.total || 15) - (balance?.earned?.used || 0)}
              </h3>
              <span className="text-muted small">days remaining</span>
            </div>
            <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
              Used: {balance?.earned?.used || 0} &bull; Pending: {balance?.earned?.pending || 0}
            </span>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card-saas p-3 border-start border-4 border-secondary">
            <span className="text-muted small fw-semibold text-uppercase">Unpaid Leave</span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h3 className="fw-bold text-dark mb-0">{balance?.unpaid?.used || 0}</h3>
              <span className="text-muted small">days utilized</span>
            </div>
            <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
              Extended personal leave without compensation
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Apply Form */}
        <div className="col-12 col-lg-5">
          <div className="card-saas p-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiCalendar className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">New Leave Petition</h5>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {success && <div className="alert alert-success py-2 small">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Leave Type *</label>
                <select
                  name="leaveType"
                  className="form-select bg-light"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="earned">Earned / Annual Vacation</option>
                  <option value="unpaid">Unpaid Leave (Without Pay)</option>
                </select>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control bg-light"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control bg-light"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Reason for Absence *</label>
                <textarea
                  name="reason"
                  className="form-control bg-light"
                  rows="3"
                  placeholder="Provide explicit context for management review..."
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={submitting}
              >
                <FiPlus /> {submitting ? 'Validating Application...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Personal Leave History Table */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4">
            <h5 className="fw-bold mb-3">My Leave History</h5>

            {loading ? (
              <LoadingSpinner message="Loading your leave applications..." />
            ) : leaves.length === 0 ? (
              <EmptyState
                icon={<FiCalendar />}
                title="No Leave Applications Yet"
                description="When you submit requests for time off, their status and approval logs will show here."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-saas align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Remarks</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l._id}>
                        <td className="text-capitalize fw-semibold">{l.leaveType}</td>
                        <td className="small">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </td>
                        <td className="fw-bold">{l.totalDays}</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '180px' }}>
                          {l.reviewComment || l.reason}
                        </td>
                        <td className="text-end">
                          {l.status === 'pending' && (
                            <button
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              onClick={() => handleCancelLeave(l._id)}
                              title="Cancel Application"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationPage;

