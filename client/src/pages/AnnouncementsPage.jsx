import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import {
  FiBell,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSend,
  FiArchive,
  FiTag,
  FiUsers
} from 'react-icons/fi';

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    targetDepartment: '',
    targetRole: 'employee',
    priority: 'normal',
    status: 'published'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, deptRes] = await Promise.all([
        apiClient.get('/announcements'),
        apiClient.get('/departments')
      ]);
      setAnnouncements(annRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      targetDepartment: '',
      targetRole: 'employee',
      priority: 'normal',
      status: 'published'
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (a) => {
    setEditingId(a._id);
    setFormData({
      title: a.title,
      content: a.content,
      targetAudience: a.targetAudience || 'all',
      targetDepartment: a.targetDepartment?._id || a.targetDepartment || '',
      targetRole: a.targetRole || 'employee',
      priority: a.priority || 'normal',
      status: a.status || 'published'
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
        await apiClient.patch(`/announcements/${editingId}`, formData);
      } else {
        await apiClient.post('/announcements', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;

    try {
      await apiClient.delete(`/announcements/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return <span className="badge bg-danger">Urgent</span>;
      case 'high':
        return <span className="badge bg-warning text-dark">High Priority</span>;
      case 'low':
        return <span className="badge bg-secondary">Low</span>;
      default:
        return <span className="badge bg-info text-dark">Normal</span>;
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '1000px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Company Bulletins & Announcements</h3>
          <p className="text-muted small mb-0">
            Official communications, company updates, quarterly targets, and departmental news.
          </p>
        </div>
        {isHR && (
          <button className="btn btn-primary d-flex align-items-center gap-1 shadow-sm" onClick={openCreateModal}>
            <FiPlus /> New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching announcement broadcasts..." />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<FiBell />}
          title="No Published Announcements"
          description="There are currently no active company bulletins available for your audience."
          action={
            isHR && (
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                Publish First Broadcast
              </button>
            )
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((a) => (
            <div key={a._id} className="card-saas p-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  {getPriorityBadge(a.priority)}
                  <span className="badge bg-light text-muted border text-capitalize">
                    Audience: {a.targetAudience}
                    {a.targetDepartment?.name ? ` (${a.targetDepartment.name})` : ''}
                  </span>
                  {isHR && (
                    <span className={`badge ${a.status === 'published' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary text-white'}`}>
                      {a.status}
                    </span>
                  )}
                </div>

                <span className="text-muted small">
                  Published: {formatDate(a.publishedAt || a.createdAt)}
                </span>
              </div>

              <h5 className="fw-bold text-dark mb-2">{a.title}</h5>
              <p className="text-secondary small mb-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {a.content}
              </p>

              <div className="d-flex align-items-center justify-content-between pt-3 border-top text-muted small">
                <span>
                  Author:{' '}
                  <strong className="text-dark">
                    {a.author?.employeeProfile
                      ? `${a.author.employeeProfile.firstName} ${a.author.employeeProfile.lastName}`
                      : a.author?.email || 'Corporate HR'}
                  </strong>
                </span>

                {isHR && (
                  <div className="d-inline-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary py-1 px-2"
                      onClick={() => openEditModal(a)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger py-1 px-2"
                      onClick={() => handleDelete(a._id, a.title)}
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

      {/* Announcement Modal */}
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
                  {editingId ? 'Edit Announcement' : 'Publish Announcement'}
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
                    <label className="form-label small fw-semibold">Bulletin Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Q4 Town Hall Meeting Scheduled"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Priority *</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Alert</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold">Status *</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft (Private)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Target Audience *</label>
                    <select
                      className="form-select"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    >
                      <option value="all">Entire Company (All Staff)</option>
                      <option value="department">Specific Department</option>
                      <option value="role">Specific Access Role</option>
                    </select>
                  </div>

                  {formData.targetAudience === 'department' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Target Department</label>
                      <select
                        className="form-select"
                        value={formData.targetDepartment}
                        onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                        required
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetAudience === 'role' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Target Role</label>
                      <select
                        className="form-select"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      >
                        <option value="employee">Standard Employees</option>
                        <option value="manager">Team Managers</option>
                        <option value="hr_admin">HR Administrators</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content / Body *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Write announcement body..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                    {saving ? 'Publishing...' : editingId ? 'Save Changes' : 'Broadcast Announcement'}
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

export default AnnouncementsPage;

