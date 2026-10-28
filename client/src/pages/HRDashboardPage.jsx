import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatTime } from '../utils/helpers';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiBell,
  FiBookOpen,
  FiArrowRight,
  FiTrendingUp
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const HRDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/hr');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load HR dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating organization statistics..." />;
  if (error) return <div className="alert alert-danger my-3">{error}</div>;
  if (!data) return null;

  const { summary, departmentDistribution, attendanceTrends, recentLeaves, upcomingHolidays, recentAnnouncements, upcomingTrainings } = data;

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">HR Executive Overview</h3>
          <p className="text-muted small mb-0">
            Live workforce metrics, daily attendance telemetry, and pending governance tasks.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/employees/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <FiUsers /> Add Employee
          </Link>
          <Link to="/leaves/approvals" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <FiCalendar /> Review Leaves ({summary.pendingLeaves})
          </Link>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Active Staff"
            value={summary.totalActiveEmployees}
            icon={<FiUsers />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            subtitle="Registered active workforce"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Present Today"
            value={summary.presentToday}
            icon={<FiUserCheck />}
            iconBg="#ECFDF5"
            iconColor="#059669"
            subtitle={`${summary.attendancePercentage}% turn-out rate`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Absent / Unmarked"
            value={summary.absentToday}
            icon={<FiUserX />}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
            subtitle={`${summary.onLeaveToday || 0} scheduled on leave`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Leaves"
            value={summary.pendingLeaves}
            icon={<FiClock />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            subtitle={`${summary.approvedLeaves} approved / ${summary.rejectedLeaves} rejected`}
          />
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="row g-4 mb-4">
        {/* Attendance Trends Area Chart */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-1">Attendance Trend (Past 7 Days)</h5>
                <span className="text-muted small">Daily headcount presence count</span>
              </div>
              <span className="badge bg-indigo-subtle text-primary border border-primary border-opacity-25">
                <FiTrendingUp className="me-1" /> Active Telemetry
              </span>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrends}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                    name="Present Staff"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Distribution Bar Chart */}
        <div className="col-12 col-lg-5">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-1">Department Distribution</h5>
                <span className="text-muted small">Staff count per unit</span>
              </div>
              <Link to="/departments" className="small text-decoration-none text-primary">
                Manage
              </Link>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity: Leaves & Side Announcements */}
      <div className="row g-4">
        {/* Recent Leave Applications */}
        <div className="col-12 col-lg-8">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Recent Leave Applications</h5>
              <Link to="/leaves/approvals" className="btn btn-outline-primary btn-sm">
                View All Approvals
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-saas align-middle">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No recent leave applications.
                      </td>
                    </tr>
                  ) : (
                    recentLeaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div className="fw-semibold text-dark">
                            {l.employee?.employeeProfile
                              ? `${l.employee.employeeProfile.firstName} ${l.employee.employeeProfile.lastName}`
                              : l.employee?.email}
                          </div>
                          <span className="text-muted small">
                            {l.employee?.employeeProfile?.designation || 'Staff'}
                          </span>
                        </td>
                        <td className="text-capitalize fw-medium">{l.leaveType}</td>
                        <td className="small">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </td>
                        <td className="fw-bold">{l.totalDays}</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                        <td>
                          {l.status === 'pending' ? (
                            <Link to="/leaves/approvals" className="btn btn-sm btn-primary py-1 px-2">
                              Review
                            </Link>
                          ) : (
                            <span className="text-muted small">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel: Holidays & Announcements */}
        <div className="col-12 col-lg-4">
          {/* Upcoming Holidays */}
          <div className="card-saas p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Upcoming Holidays</h6>
              <Link to="/holidays" className="small text-decoration-none text-primary">
                View Calendar
              </Link>
            </div>
            <div className="d-flex flex-column gap-3">
              {upcomingHolidays.slice(0, 3).map((h) => (
                <div key={h._id} className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                  <div
                    className="rounded-2 text-center py-1 px-2 bg-white border"
                    style={{ minWidth: '48px' }}
                  >
                    <span className="d-block text-danger fw-bold" style={{ fontSize: '0.7rem' }}>
                      {new Date(h.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="d-block fw-bold fs-6 text-dark lh-1">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <span className="fw-semibold text-dark small d-block">{h.name}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {h.description || 'Public Holiday'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Published News */}
          <div className="card-saas p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold mb-0">Company Bulletins</h6>
              <Link to="/announcements" className="small text-decoration-none text-primary">
                Broadcasts
              </Link>
            </div>
            <div className="d-flex flex-column gap-2">
              {recentAnnouncements.slice(0, 3).map((a) => (
                <div key={a._id} className="p-2 border-bottom">
                  <span className="badge bg-secondary bg-opacity-10 text-dark small mb-1">
                    {a.priority}
                  </span>
                  <p className="fw-semibold text-dark small mb-0">{a.title}</p>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {formatDate(a.publishedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboardPage;

