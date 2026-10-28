import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, formatTime } from '../utils/helpers';
import { FiShield, FiFilter, FiSearch, FiCode } from 'react-icons/fi';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        action: actionFilter || undefined
      };
      const res = await apiClient.get('/audit-logs', { params });
      setLogs(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Administrative Audit Trail</h3>
          <p className="text-muted small mb-0">
            Immutable log of personnel modifications, attendance adjustments, and security authentications.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card-saas p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <select
              className="form-select form-select-sm bg-light"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Logged Actions</option>
              <option value="USER_LOGIN">User Sign In (USER_LOGIN)</option>
              <option value="EMPLOYEE_CREATED">Employee Created (EMPLOYEE_CREATED)</option>
              <option value="EMPLOYEE_UPDATED">Employee Updated (EMPLOYEE_UPDATED)</option>
              <option value="ATTENDANCE_CORRECTED">Attendance Corrected (ATTENDANCE_CORRECTED)</option>
              <option value="LEAVE_APPROVED">Leave Approved (LEAVE_APPROVED)</option>
              <option value="LEAVE_REJECTED">Leave Rejected (LEAVE_REJECTED)</option>
              <option value="ANNOUNCEMENT_CREATED">Announcement Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-saas overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Querying security audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<FiShield />}
            title="No Audit Records Found"
            description="No system security events matched your active filters."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Initiated By</th>
                  <th>Target Entity</th>
                  <th>IP Address</th>
                  <th className="text-end">Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const actor = log.performedBy?.employeeProfile;
                  return (
                    <tr key={log._id}>
                      <td className="small text-muted text-nowrap">
                        {formatDate(log.createdAt)} {formatTime(log.createdAt)}
                      </td>
                      <td>
                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark small">
                          {actor ? `${actor.firstName} ${actor.lastName}` : log.performedBy?.email || 'System'}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">{log.targetEntity}</span>
                      </td>
                      <td className="small font-monospace text-muted">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary py-1 px-2"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setInspectLog(log)}
                        >
                          <FiCode /> Inspect
                        </button>
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

      {/* JSON Inspection Modal */}
      {inspectLog && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold">Audit Event Inspection</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInspectLog(null)}
                />
              </div>
              <div className="modal-body px-4 py-3">
                <div className="mb-2">
                  <strong>Action:</strong> <span className="badge bg-primary ms-1">{inspectLog.action}</span>
                </div>
                <div className="mb-2">
                  <strong>Date:</strong> {formatDate(inspectLog.createdAt)} {formatTime(inspectLog.createdAt)}
                </div>
                <div className="mb-3">
                  <strong>User Agent:</strong> <small className="text-muted">{inspectLog.userAgent || 'Internal System Client'}</small>
                </div>
                <label className="form-label small fw-semibold">Event Payload / Details:</label>
                <pre className="bg-dark text-light p-3 rounded-3 small" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {JSON.stringify(inspectLog.details, null, 2)}
                </pre>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-secondary" onClick={() => setInspectLog(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;

