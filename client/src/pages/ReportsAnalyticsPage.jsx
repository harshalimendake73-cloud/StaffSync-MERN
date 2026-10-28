import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FiActivity,
  FiDownload,
  FiUsers,
  FiUserCheck,
  FiCalendar,
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
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

const ReportsAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dashboard/hr');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get('/attendance/export', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StaffSync-Analytics-Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  if (loading) return <LoadingSpinner message="Synthesizing organizational metrics..." />;
  if (!data) return null;

  const { summary, departmentDistribution, attendanceTrends } = data;

  const leavePieData = [
    { name: 'Approved', value: summary.approvedLeaves || 0 },
    { name: 'Pending', value: summary.pendingLeaves || 0 },
    { name: 'Rejected', value: summary.rejectedLeaves || 0 }
  ];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Human Resources Executive Analytics</h3>
          <p className="text-muted small mb-0">
            Workforce composition, absence distributions, departmental headcounts, and trend modeling.
          </p>
        </div>
        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={handleExportCSV}
        >
          <FiDownload /> Download Data CSV
        </button>
      </div>

      {/* KPI Top Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            title="Total Active Roster"
            value={summary.totalActiveEmployees}
            icon={<FiUsers />}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            subtitle="Full active complement"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Daily Presence Rate"
            value={`${summary.attendancePercentage}%`}
            icon={<FiUserCheck />}
            iconBg="#ECFDF5"
            iconColor="#059669"
            subtitle={`${summary.presentToday} present today`}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Leave Fulfillment"
            value={summary.approvedLeaves}
            icon={<FiCalendar />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
            subtitle={`${summary.pendingLeaves} awaiting review`}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Departments"
            value={departmentDistribution.length}
            icon={<FiActivity />}
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            subtitle="Operating corporate units"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Department Headcount Bar Chart */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4 h-100">
            <h5 className="fw-bold mb-1">Department Headcount Comparison</h5>
            <span className="text-muted small mb-3 d-block">Number of active employees allocated per division</span>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leave Requests Status Pie Chart */}
        <div className="col-12 col-lg-5">
          <div className="card-saas p-4 h-100">
            <h5 className="fw-bold mb-1">Leave Application Distribution</h5>
            <span className="text-muted small mb-3 d-block">Approved, pending, and rejected petitions</span>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leavePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leavePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', border: 'none' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;

