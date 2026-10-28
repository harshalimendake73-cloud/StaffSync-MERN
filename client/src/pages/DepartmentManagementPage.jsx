import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiPlus, FiEdit2, FiTrash2, FiUsers, FiX } from 'react-icons/fi';

const DepartmentManagementPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    isActive: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/employees?limit=100')
      ]);
      setDepartments(deptRes.data.data || []);
      const eligibleHeads = (empRes.data.data || []).filter((e) =>
        ['hr_admin', 'manager'].includes(e.role)
      );
      setManagers(eligibleHeads);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', description: '', head: '', isActive: true });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingId(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head: dept.head?._id || dept.head || '',
      isActive: dept.isActive !== false
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await apiClient.patch(`/departments/${editingId}`, formData);
      } else {
        await apiClient.post('/departments', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name, employeeCount) => {
    if (employeeCount > 0) {
      alert(`Cannot delete "${name}": It has ${employeeCount} assigned employees. Please reassign staff first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete the department "${name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/departments/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Department Structure</h3>
          <p className="text-muted small mb-0">
            Define organizational divisions, departmental codes, leadership heads, and capacity.
          </p>
        </div>
        {isHR && (
          <button className="btn btn-primary d-flex align-items-center gap-1 shadow-sm" onClick={openCreateModal}>
            <FiPlus /> Add Department
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading organizational units..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={<FiBriefcase />}
          title="No Departments Configured"
          description="Create your first organization department to organize staff and reporting hierarchy."
          action={
            isHR && (
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                Create Department
              </button>
            )
          }
        />
      ) : (
        <div className="row g-4">
          {departments.map((dept) => (
            <div key={dept._id} className="col-12 col-md-6 col-xl-4">
              <div className="card-saas p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary text-white fw-bold">{dept.code}</span>
                    <span className={`badge ${dept.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{dept.name}</h5>
                  <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>
                    {dept.description || 'No description provided.'}
                  </p>

                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted">Department Head:</span>
                      <strong className="text-dark">
                        {dept.head?.employeeProfile
                          ? `${dept.head.employeeProfile.firstName} ${dept.head.employeeProfile.lastName}`
                          : dept.head?.email || 'Unassigned'}
                      </strong>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-muted">Total Headcount:</span>
                      <span className="badge bg-secondary text-white">
                        <FiUsers className="me-1" /> {dept.employeeCount || 0} Staff
                      </span>
                    </div>
                  </div>
                </div>

                {isHR && (
                  <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={() => openEditModal(dept)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                      onClick={() => handleDelete(dept._id, dept.name, dept.employeeCount || 0)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Department' : 'Create New Department'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Engineering"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Code / Abbreviation *</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. ENG"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department Head</label>
                    <select
                      className="form-select"
                      value={formData.head}
                      onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    >
                      <option value="">Select Department Head (Optional)</option>
                      {managers.map((m) => (
                        <option key={m.user?._id || m._id} value={m.user?._id || m._id}>
                          {m.firstName} {m.lastName} ({m.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Operational mission and responsibilities..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="deptActiveSwitch"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="deptActiveSwitch">
                      Department is Active
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Department' : 'Create Department'}
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

export default DepartmentManagementPage;

