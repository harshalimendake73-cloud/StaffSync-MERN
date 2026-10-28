import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatTime, formatDuration } from '../utils/helpers';
import { FiClock, FiFilter, FiCalendar } from 'react-icons/fi';

const AttendanceHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status || undefined
      };
      const res = await apiClient.get('/attendance', { params });
      setRecords(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, startDate, endDate, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Attendance Log History</h3>
          <p className="text-muted small mb-0">
            Historical audit records of daily clock-in sessions, shift durations, and status badges.
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="card-saas p-3 mb-4">
        <form onSubmit={handleFilterSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">From Date</label>
            <input
              type="date"
              className="form-control form-control-sm bg-light"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">To Date</label>
            <input
              type="date"
              className="form-control form-control-sm bg-light"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label small fw-semibold text-muted mb-1">Attendance Status</label>
            <select
              className="form-select form-select-sm bg-light"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div className="col-12 col-md-3 d-flex align-items-end">
            <button type="submit" className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
              <FiFilter /> Apply Date Filter
            </button>
          </div>
        </form>
      </div>

      {/* Records Table */}
      <div className="card-saas overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Querying attendance history..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<FiClock />}
            title="No Attendance Records Found"
            description="No logs match your specified date range. Try clearing or widening the date interval."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Shift Type</th>
                  <th>Clock-In</th>
                  <th>Clock-Out</th>
                  <th>Total Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const emp = r.employee?.employeeProfile;
                  return (
                    <tr key={r._id}>
                      <td className="fw-semibold text-dark">{r.date}</td>
                      <td>
                        <span className="small fw-semibold text-dark">
                          {emp ? `${emp.firstName} ${emp.lastName}` : r.employee?.email}
                        </span>
                        <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                          {emp?.employeeId || ''}
                        </span>
                      </td>
                      <td className="text-capitalize small">{r.shiftType}</td>
                      <td className="small text-muted">{formatTime(r.checkIn)}</td>
                      <td className="small text-muted">{formatTime(r.checkOut)}</td>
                      <td className="fw-bold">{formatDuration(r.durationMinutes)}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '160px' }}>
                        {r.notes || '—'}
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
    </div>
  );
};

export default AttendanceHistoryPage;

