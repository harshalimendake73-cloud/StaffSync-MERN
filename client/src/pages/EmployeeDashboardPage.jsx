import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import AttendanceWidget from '../components/AttendanceWidget';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTime, formatDuration } from '../utils/helpers';
import {
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiBell,
  FiAward,
  FiArrowRight,
  FiPlus
} from 'react-icons/fi';

const EmployeeDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployeeDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/employee');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employee dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your personal employee portal..." />;
  if (error) return <div className="alert alert-danger my-3">{error}</div>;
  if (!data) return null;

  const {
    leaveBalance,
    recentLeaves,
    recentAttendance,
    upcomingHolidays,
    announcements,
    enrolledTrainings
  } = data;

  return (
    <div className="container-fluid p-0">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Employee Workspace</h3>
          <p className="text-muted small mb-0">
            Track daily work hours, available leave quotas, and upcoming corporate events.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/leaves/apply" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <FiPlus /> Apply for Leave
          </Link>
          <Link to="/trainings" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <FiBookOpen /> Browse Courses
          </Link>
        </div>
      </div>

      {/* Main Grid: Attendance Widget + Leave Balance Buckets */}
      <div className="row g-4 mb-4">
        {/* Attendance Widget with Live Timer */}
        <div className="col-12 col-lg-5">
          <AttendanceWidget onAttendanceUpdated={fetchEmployeeDashboard} />
        </div>

        {/* 4 Leave Balances */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Annual Leave Balances</h5>
                <span className="text-muted small">{new Date().getFullYear()} Quota Allocation</span>
              </div>
              <Link to="/leaves/apply" className="btn btn-outline-primary btn-sm">
                Apply Leave
              </Link>
            </div>

            <div className="row g-3">
              <div className="col-6 col-sm-3">
                <div className="p-3 rounded-3 bg-light text-center border">
                  <span className="text-muted small fw-semibold d-block">Casual</span>
                  <h3 className="fw-bold text-primary mb-1 mt-1">
                    {(leaveBalance?.casual?.total || 12) - (leaveBalance?.casual?.used || 0)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {leaveBalance?.casual?.used || 0} used of {leaveBalance?.casual?.total || 12}
                  </span>
                </div>
              </div>

              <div className="col-6 col-sm-3">
                <div className="p-3 rounded-3 bg-light text-center border">
                  <span className="text-muted small fw-semibold d-block">Sick</span>
                  <h3 className="fw-bold text-success mb-1 mt-1">
                    {(leaveBalance?.sick?.total || 10) - (leaveBalance?.sick?.used || 0)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {leaveBalance?.sick?.used || 0} used of {leaveBalance?.sick?.total || 10}
                  </span>
                </div>
              </div>

              <div className="col-6 col-sm-3">
                <div className="p-3 rounded-3 bg-light text-center border">
                  <span className="text-muted small fw-semibold d-block">Earned</span>
                  <h3 className="fw-bold text-info mb-1 mt-1">
                    {(leaveBalance?.earned?.total || 15) - (leaveBalance?.earned?.used || 0)}
                  </h3>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {leaveBalance?.earned?.used || 0} used of {leaveBalance?.earned?.total || 15}
                  </span>
                </div>
              </div>

              <div className="col-6 col-sm-3">
                <div className="p-3 rounded-3 bg-light text-center border">
                  <span className="text-muted small fw-semibold d-block">Unpaid</span>
                  <h3 className="fw-bold text-secondary mb-1 mt-1">
                    {leaveBalance?.unpaid?.used || 0}
                  </h3>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Days taken
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-indigo-subtle rounded-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="fw-semibold text-primary small d-block">Planning Time Off?</span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Submit leaves at least 48 hours in advance for manager approval.
                </span>
              </div>
              <Link to="/leaves/apply" className="btn btn-primary btn-sm">
                Request Leave
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History & Leave Applications */}
      <div className="row g-4 mb-4">
        {/* Recent Attendance Records */}
        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Recent Attendance History</h5>
              <Link to="/attendance/history" className="small text-decoration-none text-primary">
                View Full Log
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-saas align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-3 text-muted">
                        No recent attendance records.
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.slice(0, 5).map((att) => (
                      <tr key={att._id}>
                        <td className="fw-medium">{att.date}</td>
                        <td className="small text-muted">{formatTime(att.checkIn)}</td>
                        <td className="small text-muted">{formatTime(att.checkOut)}</td>
                        <td className="small fw-semibold">{formatDuration(att.durationMinutes)}</td>
                        <td>
                          <StatusBadge status={att.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Leave Applications */}
        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">My Leave Applications</h5>
              <Link to="/leaves/apply" className="small text-decoration-none text-primary">
                New Application
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-saas align-middle">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">
                        No leave applications submitted yet.
                      </td>
                    </tr>
                  ) : (
                    recentLeaves.map((l) => (
                      <tr key={l._id}>
                        <td className="text-capitalize fw-semibold">{l.leaveType}</td>
                        <td className="small">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </td>
                        <td className="fw-bold">{l.totalDays}</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Training & Announcements */}
      <div className="row g-4">
        {/* Enrolled Trainings */}
        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Enrolled Training Programs</h5>
              <Link to="/trainings" className="small text-decoration-none text-primary">
                Course Catalog
              </Link>
            </div>

            {enrolledTrainings.length === 0 ? (
              <p className="text-muted small py-3 text-center">
                You are not currently enrolled in any training program.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {enrolledTrainings.map((enr) => (
                  <div key={enr._id} className="p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-dark small">{enr.training?.title}</span>
                      <StatusBadge status={enr.status} />
                    </div>
                    <div className="d-flex align-items-center justify-content-between text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                      <span>Instructor: {enr.training?.instructor}</span>
                      <span>{enr.progressPercent}% Completed</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Announcements & Upcoming Holidays */}
        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Company Updates & Holidays</h5>
              <Link to="/announcements" className="small text-decoration-none text-primary">
                All Bulletins
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {announcements.slice(0, 2).map((a) => (
                <div key={a._id} className="p-2 border-start border-3 border-primary bg-light rounded-end">
                  <span className="badge bg-secondary bg-opacity-25 text-dark small mb-1">
                    {a.priority}
                  </span>
                  <span className="fw-semibold text-dark small d-block">{a.title}</span>
                  <p className="text-muted small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                    {a.content}
                  </p>
                </div>
              ))}

              <div className="pt-2 border-top">
                <span className="fw-semibold small d-block mb-2 text-dark">Next Upcoming Holiday:</span>
                {upcomingHolidays.length > 0 ? (
                  <div className="d-flex align-items-center gap-2 p-2 bg-indigo-subtle rounded">
                    <FiAward className="text-primary fs-5" />
                    <div>
                      <strong className="text-dark small d-block">{upcomingHolidays[0].name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {formatDate(upcomingHolidays[0].date)} &bull; {upcomingHolidays[0].description}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted small">No upcoming holidays scheduled.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;

