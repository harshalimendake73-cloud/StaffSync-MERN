import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime, formatDuration } from '../utils/helpers';
import {
  FiFileText,
  FiDownload,
  FiEdit,
  FiUserCheck,
  FiClock,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';

const AttendanceReportsPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [page, setPage] = useState(1);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    status: 'present',
    correctionReason: ''
  });
  const [savingCorrection, setSavingCorrection] = useState(false);
  const [correctionError, setCorrectionError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, recRes] = await Promise.all([
        apiClient.get('/attendance/reports/summary', { params: { month, year } }),
        apiClient.get('/attendance', { params: { page, limit: 15 } })
      ]);
      setSummary(sumRes.data.data);
      setRecords(recRes.data.data || []);
      setPagination(recRes.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get('/attendance/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StaffSync-Attendance-Report-${year}-${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    }
  };

  const openCorrectionModal = (record) => {
    setCorrectionTarget(record);
    setCorrectionForm({
      status: record.status || 'present',
      correctionReason: ''
    });
    setCorrectionError(null);
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctionTarget) return;

    setSavingCorrection(true);
    setCorrectionError(null);

    try {
      await apiClient.patch(`/attendance/${correctionTarget._id}/correct`, correctionForm);
      setCorrectionTarget(null);
      fetchData();
    } catch (err) {
      setCorrectionError(err.response?.data?.message || 'Failed to submit attendance correction');
    } finally {
      setSavingCorrection(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Attendance Telemetry & Reports</h3>
          <p className="text-muted small mb-0">
            Monthly aggregate working hours, attendance distributions, CSV exports, and administrative audits.
          </p>
        </div>
        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={handleExportCSV}
        >
          <FiDownload /> Export CSV Report
        </button>
      </div>

      {/* Month / Year Filter Selector */}
      <div className="card-saas p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <span className="small fw-semibold text-muted">Summary Month:</span>
            <select
              className="form-select form-select-sm bg-light mt-1"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <span className="small fw-semibold text-muted">Calendar Year:</span>
            <select
              className="form-select form-select-sm bg-light mt-1"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatCard
              title="Present Records"
              value={summary.present}
              icon={<FiUserCheck />}
              iconBg="#ECFDF5"
              iconColor="#059669"
              subtitle={`${summary.totalRecords} total sessions in range`}
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              title="Late Arrivals"
              value={summary.late}
              icon={<FiClock />}
              iconBg="#FEF3C7"
              iconColor="#D97706"
              subtitle="Checked in after 09:30"
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              title="Half-Day Sessions"
              value={summary.halfDay}
              icon={<FiAlertTriangle />}
              iconBg="#EEF2FF"
              iconColor="#4F46E5"
              subtitle="Worked less than 4.5 hours"
            />
          </div>
          <div className="col-6 col-md-3">
            <StatCard
              title="Total Work Hours"
              value={`${summary.totalHoursWorked} hrs`}
              icon={<FiActivity />}
              iconBg="#F5F3FF"
              iconColor="#7C3AED"
              subtitle="Aggregated time across team"
            />
          </div>
        </div>
      )}

      {/* Attendance Detail Table */}
      <div className="card-saas overflow-hidden">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">Detailed Attendance Records</h5>
          <span className="text-muted small">Showing live synchronized logs</span>
        </div>

        {loading ? (
          <LoadingSpinner message="Generating report telemetry..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff Member</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours Worked</th>
                  <th>Status</th>
                  <th>Corrections</th>
                  {isHR && <th className="text-end">Action</th>}
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
                          {emp?.department?.name || 'Department'} &bull; {emp?.employeeId || ''}
                        </span>
                      </td>
                      <td className="small text-muted">{formatTime(r.checkIn)}</td>
                      <td className="small text-muted">{formatTime(r.checkOut)}</td>
                      <td className="fw-bold">{formatDuration(r.durationMinutes)}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '160px' }}>
                        {r.correctionReason ? (
                          <span className="badge bg-warning bg-opacity-25 text-dark" title={r.correctionReason}>
                            Corrected: {r.correctionReason}
                          </span>
                        ) : (
                          'Standard Clock'
                        )}
                      </td>
                      {isHR && (
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-secondary py-1 px-2 d-inline-flex align-items-center gap-1"
                            onClick={() => openCorrectionModal(r)}
                            title="HR Administrative Correction"
                          >
                            <FiEdit /> Correct
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* HR Correction Modal */}
      {correctionTarget && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold">HR Attendance Correction</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCorrectionTarget(null)}
                />
              </div>

              <form onSubmit={handleCorrectionSubmit}>
                <div className="modal-body px-4 py-3">
                  {correctionError && (
                    <div className="alert alert-danger py-2 small">{correctionError}</div>
                  )}

                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Target Record:</span>
                      <strong>{correctionTarget.date}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Staff:</span>
                      <strong>
                        {correctionTarget.employee?.employeeProfile
                          ? `${correctionTarget.employee.employeeProfile.firstName} ${correctionTarget.employee.employeeProfile.lastName}`
                          : correctionTarget.employee?.email}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Adjust Attendance Status *</label>
                    <select
                      className="form-select"
                      value={correctionForm.status}
                      onChange={(e) =>
                        setCorrectionForm({ ...correctionForm, status: e.target.value })
                      }
                      required
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                      <option value="absent">Absent</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Audit Correction Reason *
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Employee forgot to clock in; verified badge access entry."
                      value={correctionForm.correctionReason}
                      onChange={(e) =>
                        setCorrectionForm({ ...correctionForm, correctionReason: e.target.value })
                      }
                      required
                    />
                    <span className="text-muted mt-1 d-block" style={{ fontSize: '0.72rem' }}>
                      This reason is permanently logged in the system audit trail.
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setCorrectionTarget(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingCorrection}>
                    {savingCorrection ? 'Saving Audit Record...' : 'Apply Correction'}
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

export default AttendanceReportsPage;

