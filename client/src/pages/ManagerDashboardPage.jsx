import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getInitials } from '../utils/helpers';
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiCheckSquare,
  FiBookOpen,
  FiAward,
  FiArrowRight
} from 'react-icons/fi';

const ManagerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchManagerStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/manager');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading team operations data..." />;
  if (error) return <div className="alert alert-danger my-3">{error}</div>;
  if (!data) return null;

  const {
    teamSize,
    teamAttendanceSummary,
    pendingTeamLeavesCount,
    pendingTeamLeaves,
    recentApprovals,
    upcomingTrainings,
    trainingStats,
    teamMembers
  } = data;

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Team Operations Center</h3>
          <p className="text-muted small mb-0">
            Monitor direct reports, review leave petitions, and supervise training completion.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/leaves/approvals" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <FiCheckSquare /> Review Team Leaves ({pendingTeamLeavesCount})
          </Link>
          <Link to="/attendance/reports" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <FiClock /> Team Attendance
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Assigned Direct Team"
            value={teamSize}
            icon={<FiUsers />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            subtitle="Reporting team members"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Team Present Today"
            value={teamAttendanceSummary.presentToday}
            icon={<FiUserCheck />}
            iconBg="#ECFDF5"
            iconColor="#059669"
            subtitle={`${teamAttendanceSummary.attendancePercentage}% turn-out rate`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pending Team Leaves"
            value={pendingTeamLeavesCount}
            icon={<FiClock />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            subtitle="Requires manager sign-off"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Skill Certifications"
            value={`${trainingStats.completed} / ${trainingStats.totalEnrollments}`}
            icon={<FiAward />}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            subtitle={`${trainingStats.inProgress} in progress`}
          />
        </div>
      </div>

      {/* Pending Leaves & Direct Reports Directory */}
      <div className="row g-4 mb-4">
        {/* Pending Team Leaves */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Pending Team Leave Petitions</h5>
              <Link to="/leaves/approvals" className="btn btn-outline-primary btn-sm">
                Manage Approvals
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-saas align-middle">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Days</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTeamLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No pending team leave applications. All clear!
                      </td>
                    </tr>
                  ) : (
                    pendingTeamLeaves.map((l) => (
                      <tr key={l._id}>
                        <td>
                          <div className="fw-semibold text-dark">
                            {l.employee?.employeeProfile
                              ? `${l.employee.employeeProfile.firstName} ${l.employee.employeeProfile.lastName}`
                              : 'Team Member'}
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
                          <Link to="/leaves/approvals" className="btn btn-sm btn-primary py-1 px-3">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Assigned Team Members Directory Card */}
        <div className="col-12 col-lg-5">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Team Member Directory</h5>
              <span className="badge bg-light text-dark">{teamMembers.length} Staff</span>
            </div>

            <div className="d-flex flex-column gap-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {teamMembers.map((m) => (
                <div key={m._id} className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                      style={{ width: '38px', height: '38px', backgroundColor: '#4F46E5', fontSize: '0.85rem' }}
                    >
                      {getInitials(`${m.firstName} ${m.lastName}`)}
                    </div>
                    <div>
                      <span className="fw-semibold text-dark small d-block">
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {m.designation} &bull; {m.employeeId}
                      </span>
                    </div>
                  </div>
                  <Link to={`/employees/${m._id}`} className="btn btn-outline-secondary btn-sm py-1 px-2" style={{ fontSize: '0.75rem' }}>
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Approvals & Upcoming Training */}
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <h5 className="fw-bold mb-3">Recent Approval Decisions</h5>
            {recentApprovals.length === 0 ? (
              <p className="text-muted small">No recent review activity recorded.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recentApprovals.map((ra) => (
                  <div key={ra._id} className="p-2 border rounded d-flex align-items-center justify-content-between">
                    <div>
                      <span className="fw-semibold small d-block">
                        {ra.employee?.employeeProfile?.firstName} {ra.employee?.employeeProfile?.lastName}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {ra.totalDays} day(s) &bull; {ra.leaveType}
                      </span>
                    </div>
                    <StatusBadge status={ra.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0">Upcoming Training Programs</h5>
              <Link to="/trainings" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>
            {upcomingTrainings.length === 0 ? (
              <p className="text-muted small">No scheduled trainings for this department.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {upcomingTrainings.map((t) => (
                  <div key={t._id} className="p-3 bg-light rounded d-flex align-items-center justify-content-between">
                    <div>
                      <span className="fw-semibold text-dark small d-block">{t.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Instructor: {t.instructor} &bull; Capacity: {t.capacity}
                      </span>
                    </div>
                    <span className="badge bg-indigo-subtle text-primary border border-primary border-opacity-25">
                      {formatDate(t.startDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;

