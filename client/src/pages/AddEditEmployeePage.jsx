import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSave, FiArrowLeft, FiUser, FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi';

const AddEditEmployeePage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    designation: '',
    employmentStatus: 'full_time',
    joiningDate: new Date().toISOString().split('T')[0],
    reportingManager: '',
    password: 'StaffSync@2026',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'USA'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          apiClient.get('/departments'),
          apiClient.get('/employees?limit=100')
        ]);
        setDepartments(deptRes.data.data || []);
        // Eligible managers: hr_admin or manager roles
        const mgrs = (empRes.data.data || []).filter((e) =>
          ['hr_admin', 'manager'].includes(e.role)
        );
        setManagers(mgrs);

        if (isEdit) {
          const detailRes = await apiClient.get(`/employees/${id}`);
          const p = detailRes.data.data;
          setFormData({
            employeeId: p.employeeId || '',
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            email: p.email || '',
            phone: p.phone || '',
            role: p.role || 'employee',
            department: p.department?._id || p.department || '',
            designation: p.designation || '',
            employmentStatus: p.employmentStatus || 'full_time',
            joiningDate: p.joiningDate ? p.joiningDate.split('T')[0] : '',
            reportingManager: p.reportingManager?._id || p.reportingManager || '',
            password: '',
            address: {
              street: p.address?.street || '',
              city: p.address?.city || '',
              state: p.address?.state || '',
              postalCode: p.address?.postalCode || '',
              country: p.address?.country || 'USA'
            },
            emergencyContact: {
              name: p.emergencyContact?.name || '',
              relationship: p.emergencyContact?.relationship || '',
              phone: p.emergencyContact?.phone || ''
            }
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize form data');
      } finally {
        setFetching(false);
      }
    };

    fetchMetadata();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        await apiClient.patch(`/employees/${id}`, formData);
      } else {
        await apiClient.post('/employees', formData);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner message="Loading employee configuration..." />;

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Link to="/employees" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-1">
            <FiArrowLeft /> Back to Directory
          </Link>
          <h3 className="fw-bold brand-font text-dark mb-0">
            {isEdit ? 'Edit Employee Profile' : 'Onboard New Employee'}
          </h3>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Basic Personal Info */}
        <div className="card-saas p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <FiUser className="text-primary fs-5" />
            <h5 className="fw-bold mb-0">Personal & Account Credentials</h5>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                className="form-control"
                placeholder="EMP-1020"
                value={formData.employeeId}
                onChange={handleChange}
                disabled={isEdit}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Work Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="jane.doe@staffsync.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isEdit}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {!isEdit && (
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Default Initial Password</label>
                <input
                  type="text"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Default is StaffSync@2026. Employee will be prompted to change upon sign-in.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Corporate Role & Department Allocation */}
        <div className="card-saas p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <FiBriefcase className="text-primary fs-5" />
            <h5 className="fw-bold mb-0">Role & Department Allocation</h5>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Assigned Department *</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Official Designation / Title *</label>
              <input
                type="text"
                name="designation"
                className="form-control"
                placeholder="Senior Full Stack Engineer"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Portal Access Role *</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="employee">Standard Employee</option>
                <option value="manager">Team Manager</option>
                <option value="hr_admin">HR Administrator</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Employment Status *</label>
              <select
                name="employmentStatus"
                className="form-select"
                value={formData.employmentStatus}
                onChange={handleChange}
              >
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
                <option value="probation">Probation</option>
              </select>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                className="form-control"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold">Reporting Manager</label>
              <select
                name="reportingManager"
                className="form-select"
                value={formData.reportingManager}
                onChange={handleChange}
              >
                <option value="">None (Top-Level Executive)</option>
                {managers.map((m) => (
                  <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                    {m.firstName} {m.lastName} ({m.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address and Emergency Contact */}
        <div className="card-saas p-4 mb-4">
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
            <FiMapPin className="text-primary fs-5" />
            <h5 className="fw-bold mb-0">Residential & Emergency Contact</h5>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-semibold">Street Address</label>
              <input
                type="text"
                name="address.street"
                className="form-control"
                placeholder="42 Enterprise Way, Suite 200"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">City</label>
              <input
                type="text"
                name="address.city"
                className="form-control"
                placeholder="San Francisco"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">State / Region</label>
              <input
                type="text"
                name="address.state"
                className="form-control"
                placeholder="California"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Postal Code</label>
              <input
                type="text"
                name="address.postalCode"
                className="form-control"
                placeholder="94107"
                value={formData.address.postalCode}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                className="form-control"
                placeholder="Full Contact Name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Relationship</label>
              <input
                type="text"
                name="emergencyContact.relationship"
                className="form-control"
                placeholder="Spouse / Parent / Sibling"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Emergency Contact Phone</label>
              <input
                type="text"
                name="emergencyContact.phone"
                className="form-control"
                placeholder="+1 (555) 019-9999"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="d-flex align-items-center justify-content-end gap-2 pb-5">
          <Link to="/employees" className="btn btn-outline-secondary px-4">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary px-4 d-flex align-items-center gap-2 shadow-sm"
            disabled={loading}
          >
            <FiSave /> {loading ? 'Saving Profile...' : isEdit ? 'Update Employee' : 'Create Employee Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmployeePage;

