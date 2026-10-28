import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDate, getInitials, getRoleLabel } from '../utils/helpers';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiEdit2,
  FiShield
} from 'react-icons/fi';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/employees/${id}`);
        setEmployee(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employee record');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <LoadingSpinner message="Retrieving employee credentials..." />;
  if (error) return <div className="alert alert-danger my-3">{error}</div>;
  if (!employee) return null;

  const isActive = employee.user?.isActive !== false;

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Link to="/employees" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
          <FiArrowLeft /> Back to Directory
        </Link>
        {isHR && (
          <Link to={`/employees/${employee._id}/edit`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            <FiEdit2 /> Edit Record
          </Link>
        )}
      </div>

      {/* Main Profile Card Header */}
      <div className="card-saas p-4 mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
            style={{ width: '72px', height: '72px', backgroundColor: '#4F46E5', fontSize: '1.75rem' }}
          >
            {getInitials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0 text-dark">
                {employee.firstName} {employee.lastName}
              </h3>
              <StatusBadge status={employee.employmentStatus} />
              {!isActive && <span className="badge bg-danger">Deactivated</span>}
            </div>
            <p className="text-muted mb-1">{employee.designation}</p>
            <div className="d-flex flex-wrap gap-3 small text-muted">
              <span>ID: <strong className="text-dark">{employee.employeeId}</strong></span>
              <span>&bull;</span>
              <span>Role: <strong className="text-dark">{getRoleLabel(employee.role)}</strong></span>
              <span>&bull;</span>
              <span>Joined: {formatDate(employee.joiningDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Organization Details */}
        <div className="col-12 col-md-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiBriefcase className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">Employment & Hierarchy</h5>
            </div>

            <div className="d-flex flex-column gap-3 small">
              <div>
                <span className="text-muted d-block">Department:</span>
                <strong className="text-dark fs-6">{employee.department?.name || 'Unassigned'}</strong>
                {employee.department?.code && (
                  <span className="badge bg-light text-dark ms-2 border">{employee.department.code}</span>
                )}
              </div>

              <div>
                <span className="text-muted d-block">Reporting Manager:</span>
                {employee.reportingManager ? (
                  <span className="text-dark fw-semibold">
                    {employee.reportingManager.employeeProfile
                      ? `${employee.reportingManager.employeeProfile.firstName} ${employee.reportingManager.employeeProfile.lastName}`
                      : employee.reportingManager.email}
                  </span>
                ) : (
                  <span className="text-muted">None (Executive Board)</span>
                )}
              </div>

              <div>
                <span className="text-muted d-block">Official Work Email:</span>
                <span className="text-dark fw-semibold d-flex align-items-center gap-1 mt-1">
                  <FiMail className="text-muted" /> {employee.email}
                </span>
              </div>

              <div>
                <span className="text-muted d-block">Work Phone:</span>
                <span className="text-dark fw-semibold d-flex align-items-center gap-1 mt-1">
                  <FiPhone className="text-muted" /> {employee.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Address & Emergency Contact */}
        <div className="col-12 col-md-6">
          <div className="card-saas p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiMapPin className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">Contact & Emergency</h5>
            </div>

            <div className="d-flex flex-column gap-3 small">
              <div>
                <span className="text-muted d-block">Residential Address:</span>
                {employee.address?.street ? (
                  <span className="text-dark fw-semibold d-block mt-1">
                    {employee.address.street}, {employee.address.city}, {employee.address.state}{' '}
                    {employee.address.postalCode}, {employee.address.country}
                  </span>
                ) : (
                  <span className="text-muted">Address on file is private or not configured.</span>
                )}
              </div>

              <div className="pt-2 border-top">
                <span className="text-muted d-block mb-1">Emergency Contact:</span>
                {employee.emergencyContact?.name ? (
                  <div className="p-2 bg-light rounded-3">
                    <strong className="text-dark d-block">{employee.emergencyContact.name}</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Relation: {employee.emergencyContact.relationship || 'Emergency point'}
                    </span>
                    <span className="d-block text-primary fw-semibold mt-1">
                      {employee.emergencyContact.phone}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted">No emergency contact registered.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;

