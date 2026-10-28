import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate, getInitials, getRoleLabel } from '../utils/helpers';
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiFilter,
  FiEdit2,
  FiEye,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const EmployeeDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [status, setStatus] = useState(searchParams.get('employmentStatus') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const teamOnly = searchParams.get('teamOnly') === 'true';

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        department: department || undefined,
        role: role || undefined,
        employmentStatus: status || undefined,
        teamOnly: teamOnly ? 'true' : undefined
      };

      const res = await apiClient.get('/employees', { params });
      setEmployees(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, department, role, status, teamOnly]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleDeactivateToggle = async (profileId, currentActive) => {
    if (!window.confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this employee?`)) {
      return;
    }

    try {
      await apiClient.patch(`/employees/${profileId}/status`, {
        isActive: !currentActive
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee status');
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">
            {teamOnly ? 'My Assigned Team Directory' : 'Organization Employee Directory'}
          </h3>
          <p className="text-muted small mb-0">
            {teamOnly
              ? 'View and manage direct reports in your departmental group.'
              : 'Browse corporate staff, departmental allocations, and reporting hierarchy.'}
          </p>
        </div>
        {isHR && (
          <Link to="/employees/new" className="btn btn-primary d-flex align-items-center gap-1 shadow-sm">
            <FiPlus /> Add New Employee
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-saas p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by name, ID, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select bg-light"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select bg-light"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="hr_admin">HR Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select bg-light"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          <div className="col-6 col-md-1">
            <button type="submit" className="btn btn-outline-primary w-100">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="card-saas overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching employee records..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<FiUsers />}
            title="No Employees Found"
            description="No staff match your current search criteria. Try modifying your filters or clearing search."
            action={
              isHR ? (
                <Link to="/employees/new" className="btn btn-primary btn-sm">
                  Add First Employee
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-saas align-middle mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Manager</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const isActive = emp.user?.isActive !== false;
                  return (
                    <tr key={emp._id} className={!isActive ? 'opacity-75 bg-light' : ''}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{
                              width: '38px',
                              height: '38px',
                              backgroundColor: isActive ? '#4F46E5' : '#94A3B8',
                              fontSize: '0.85rem'
                            }}
                          >
                            {getInitials(`${emp.firstName} ${emp.lastName}`)}
                          </div>
                          <div>
                            <Link
                              to={`/employees/${emp._id}`}
                              className="fw-bold text-dark text-decoration-none small d-block"
                            >
                              {emp.firstName} {emp.lastName}
                            </Link>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {emp.designation}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold text-secondary small">{emp.employeeId}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {emp.department?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="small text-capitalize">{emp.role?.replace('_', ' ')}</td>
                      <td>
                        <StatusBadge status={emp.employmentStatus} />
                        {!isActive && (
                          <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="small text-muted">
                        {emp.reportingManager?.employeeProfile
                          ? `${emp.reportingManager.employeeProfile.firstName} ${emp.reportingManager.employeeProfile.lastName}`
                          : emp.reportingManager?.email || '—'}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Link
                            to={`/employees/${emp._id}`}
                            className="btn btn-sm btn-outline-secondary py-1 px-2"
                            title="View Profile"
                          >
                            <FiEye />
                          </Link>
                          {isHR && (
                            <>
                              <Link
                                to={`/employees/${emp._id}/edit`}
                                className="btn btn-sm btn-outline-primary py-1 px-2"
                                title="Edit Employee"
                              >
                                <FiEdit2 />
                              </Link>
                              <button
                                className={`btn btn-sm py-1 px-2 ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                title={isActive ? 'Deactivate Account' : 'Reactivate Account'}
                                onClick={() => handleDeactivateToggle(emp._id, isActive)}
                              >
                                {isActive ? <FiXCircle /> : <FiCheckCircle />}
                              </button>
                            </>
                          )}
                        </div>
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

export default EmployeeDirectoryPage;

