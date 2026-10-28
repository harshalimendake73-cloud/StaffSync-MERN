import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import {
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiCheck,
  FiX,
  FiFilter
} from 'react-icons/fi';

const LeaveApprovalPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);

  // Review Modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter || undefined
      };
      const res = await apiClient.get('/leaves', { params });
      setLeaves(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const openReviewModal = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setComment(type === 'approve' ? 'Approved. Proceed as planned.' : '');
    setError(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave || !actionType) return;

    setProcessing(true);
    setError(null);

    try {
      await apiClient.patch(`/leaves/${selectedLeave._id}/${actionType}`, {
        comment
      });
      setSelectedLeave(null);
      setActionType(null);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionType} leave request`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">
            {isHR ? 'Organization Leave Review Console' : 'Team Leave Approvals'}
          </h3>
          <p className="text-muted small mb-0">
            {isHR
              ? 'Authorize company-wide leave petitions and maintain statutory absence records.'
              : 'Review and sign off on absence requests submitted by your direct reports.'}
          </p>
        </div>
      </div>

      {/* Status Filter Tab Pills */}
      <div className="card-saas p-3 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
            >
              Pending Approval
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'approved' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('approved');
                setPage(1);
              }}
            >
              Approved
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'rejected' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('rejected');
                setPage(1);
              }}
            >
              Rejected
            </button>
            <button
              className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => {
                setStatusFilter('');
                setPage(1);
              }}
            >
              All Records
            </button>
          </div>
        </div>
      </div>

      {/* Main Leave Requests Table */}
      <div className="card-saas overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading leave applications..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={<FiCheckCircle />}
            title="No Leave Petitions in This View"
            description={`There are currently no leave requests with status "${statusFilter || 'all'}".`}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Total Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => {
                  const emp = leave.employee?.employeeProfile;
                  return (
                    <tr key={leave._id}>
                      <td>
                        <div className="fw-semibold text-dark">
                          {emp ? `${emp.firstName} ${emp.lastName}` : leave.employee?.email}
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {emp?.designation || 'Staff'} &bull; {emp?.employeeId || ''}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {emp?.department?.name || 'Department'}
                        </span>
                      </td>
                      <td className="text-capitalize fw-semibold">{leave.leaveType}</td>
                      <td className="small">
                        {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
                      </td>
                      <td className="fw-bold">{leave.totalDays} day(s)</td>
                      <td className="small text-muted" style={{ maxWidth: '200px' }}>
                        {leave.reason}
                      </td>
                      <td>
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="text-end">
                        {leave.status === 'pending' ? (
                          <div className="d-inline-flex gap-1">
                            <button
                              className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-2"
                              onClick={() => openReviewModal(leave, 'approve')}
                            >
                              <FiCheck /> Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1 px-2"
                              onClick={() => openReviewModal(leave, 'reject')}
                            >
                              <FiX /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {leave.reviewedBy
                              ? `Reviewed by ${leave.reviewedBy.employeeProfile?.firstName || 'Lead'}`
                              : 'Archived'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Review Confirmation Modal */}
      {selectedLeave && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold text-capitalize">
                  {actionType} Leave Request
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLeave(null)}
                />
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body px-4 py-3">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}

                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Applicant:</span>
                      <strong>
                        {selectedLeave.employee?.employeeProfile
                          ? `${selectedLeave.employee.employeeProfile.firstName} ${selectedLeave.employee.employeeProfile.lastName}`
                          : selectedLeave.employee?.email}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Type:</span>
                      <strong className="text-capitalize">{selectedLeave.leaveType} Leave</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Duration:</span>
                      <strong>
                        {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({selectedLeave.totalDays} days)
                      </strong>
                    </div>
                    <div className="mt-2 pt-2 border-top">
                      <span className="text-muted d-block">Stated Reason:</span>
                      <em>"{selectedLeave.reason}"</em>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Review Comments / Manager Notes
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add mandatory feedback or approval note..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required={actionType === 'reject'}
                    />
                    {actionType === 'approve' && (
                      <span className="text-muted mt-1 d-block" style={{ fontSize: '0.72rem' }}>
                        Approving will automatically deduct {selectedLeave.totalDays} day(s) from the employee's {selectedLeave.leaveType} leave balance.
                      </span>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedLeave(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : `Confirm ${actionType}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPage;

