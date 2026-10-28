import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import {
  FiBookOpen,
  FiPlus,
  FiUsers,
  FiClock,
  FiAward,
  FiCheckCircle,
  FiSliders
} from 'react-icons/fi';

const TrainingManagementPage = () => {
  const { user } = useAuth();
  const canManage = ['hr_admin', 'manager'].includes(user?.role);

  const [trainings, setTrainings] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    startDate: '',
    endDate: '',
    durationHours: 8,
    capacity: 20,
    department: '',
    status: 'upcoming'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        apiClient.get('/trainings'),
        apiClient.get('/departments')
      ]);
      setTrainings(tRes.data.data || []);
      setDepartments(dRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (trainingId) => {
    try {
      setEnrollingId(trainingId);
      await apiClient.post(`/trainings/${trainingId}/enroll`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll in program');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiClient.post('/trainings', formData);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create training program');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Corporate Training & Upskilling</h3>
          <p className="text-muted small mb-0">
            Professional development courses, cloud mastery, leadership workshops, and compliance programs.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/trainings/enrollments" className="btn btn-outline-secondary d-flex align-items-center gap-1 shadow-sm">
            <FiSliders /> Enrollment & Progress Hub
          </Link>
          {canManage && (
            <button
              className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
              onClick={() => setShowModal(true)}
            >
              <FiPlus /> Create Program
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading training programs..." />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen />}
          title="No Active Training Programs"
          description="There are currently no scheduled courses available in the directory."
          action={
            canManage && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                Add New Training Course
              </button>
            )
          }
        />
      ) : (
        <div className="row g-4">
          {trainings.map((t) => {
            const isFull = t.enrolledCount >= t.capacity;
            return (
              <div key={t._id} className="col-12 col-md-6 col-xl-4">
                <div className="card-saas p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-indigo-subtle text-primary border border-primary border-opacity-25">
                        {t.department?.name || 'All Departments'}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                    <p className="text-muted small mb-3" style={{ minHeight: '44px' }}>
                      {t.description}
                    </p>

                    <div className="p-3 bg-light rounded-3 mb-3 small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Instructor:</span>
                        <strong className="text-dark">{t.instructor}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Schedule:</span>
                        <span>{formatDate(t.startDate)} - {formatDate(t.endDate)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Duration:</span>
                        <span>{t.durationHours} Hours</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Enrolled:</span>
                        <span className={`fw-bold ${isFull ? 'text-danger' : 'text-primary'}`}>
                          {t.enrolledCount || 0} / {t.capacity} seats
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-top">
                    {t.isEnrolled ? (
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="badge bg-success d-flex align-items-center gap-1 py-2 px-3">
                          <FiCheckCircle /> Enrolled ({t.myProgressPercent || 0}%)
                        </span>
                        <Link to="/trainings/enrollments" className="btn btn-sm btn-outline-secondary">
                          Update Progress
                        </Link>
                      </div>
                    ) : isFull ? (
                      <button className="btn btn-secondary btn-sm w-100" disabled>
                        Program Full
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                        disabled={enrollingId === t._id || t.status === 'completed'}
                        onClick={() => handleEnroll(t._id)}
                      >
                        <FiBookOpen /> {enrollingId === t._id ? 'Enrolling...' : 'Enroll in Program'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Program Creation Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold">Create Training Program</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body px-4 py-3">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Program Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Microservices & Kubernetes in Production"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Lead Instructor *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Architect / External Trainer"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Duration (Hours) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.durationHours}
                        onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value, 10) || 1 })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Capacity (Seats) *</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Associated Department</label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">All Departments (General)</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Course Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Syllabus and learning outcomes..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
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
                    {saving ? 'Creating Program...' : 'Create Training Program'}
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

export default TrainingManagementPage;

