import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import AttendanceWidget from '../components/AttendanceWidget';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTime, formatDuration } from '../utils/helpers';
import { FiClock, FiShield, FiInfo, FiCalendar } from 'react-icons/fi';

const AttendanceClockPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecent = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/me');
      setHistory(res.data.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Workday Time & Attendance Station</h3>
          <p className="text-muted small mb-0">
            Precision employee check-in with overnight shift handling and working-hour tracking.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Attendance Widget */}
        <div className="col-12 col-md-6">
          <AttendanceWidget onAttendanceUpdated={fetchRecent} />
        </div>

        {/* Corporate Shift & Overnight Policy Documentation Card */}
        <div className="col-12 col-md-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiShield className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">Shift & Overnight Attendance Policy</h5>
            </div>

            <div className="d-flex flex-column gap-3 small">
              <div className="p-3 bg-light rounded-3">
                <strong className="text-dark d-block mb-1">Standard Work Hours:</strong>
                <p className="text-muted mb-0">
                  09:00 to 18:00 (8 active work hours + 1 hour meal intermission). Arrivals after 09:30 AM are automatically categorized as <span className="badge bg-warning text-dark">Late</span>.
                </p>
              </div>

              <div className="p-3 bg-indigo-subtle rounded-3">
                <strong className="text-primary d-block mb-1">Overnight Shift Policy:</strong>
                <p className="text-muted mb-0">
                  Check-ins initiated in the evening (after 18:00) with the overnight switch toggled are safely attributed to the start date's business workday cycle, preventing duplicate day session conflicts.
                </p>
              </div>

              <div className="p-3 bg-light rounded-3">
                <strong className="text-dark d-block mb-1">Single Session Integrity:</strong>
                <p className="text-muted mb-0">
                  StaffSync enforces exactly one valid completed session per workday. Timestamps are verified by server NTP time standards and cannot be manipulated by client browser clocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Personal Logs */}
      <div className="card-saas p-4">
        <h5 className="fw-bold mb-3">Recent 10 Attendance Logs</h5>
        {loading ? (
          <LoadingSpinner message="Loading attendance logs..." />
        ) : history.length === 0 ? (
          <p className="text-muted small py-3 text-center mb-0">No past attendance logs found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shift Type</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Total Time</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((r) => (
                  <tr key={r._id}>
                    <td className="fw-medium">{r.date}</td>
                    <td className="text-capitalize small">{r.shiftType}</td>
                    <td className="small text-muted">{formatTime(r.checkIn)}</td>
                    <td className="small text-muted">{formatTime(r.checkOut)}</td>
                    <td className="fw-bold">{formatDuration(r.durationMinutes)}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="small text-muted">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceClockPage;

