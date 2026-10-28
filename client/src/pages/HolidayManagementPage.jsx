import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import { FiAward, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';

const HolidayManagementPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    isOptional: false
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/holidays', { params: { year } });
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await apiClient.post('/holidays', formData);
      setShowModal(false);
      setFormData({ name: '', date: '', description: '', isOptional: false });
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete holiday "${name}"?`)) return;

    try {
      await apiClient.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Corporate Holiday Calendar</h3>
          <p className="text-muted small mb-0">
            Recognized national holidays, festive corporate closures, and optional observances.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm bg-light"
            style={{ width: '110px' }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          {isHR && (
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={() => setShowModal(true)}>
              <FiPlus /> Add Holiday
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying corporate holiday schedule..." />
      ) : holidays.length === 0 ? (
        <EmptyState
          icon={<FiAward />}
          title="No Holidays Configured for this Year"
          description="Use the button above to add organization-wide paid holidays."
        />
      ) : (
        <div className="row g-3">
          {holidays.map((h) => {
            const dateObj = new Date(h.date);
            const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayNum = dateObj.getDate();
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <div key={h._id} className="col-12 col-md-6">
                <div className="card-saas p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 text-center py-2 px-3 bg-light border"
                      style={{ minWidth: '60px' }}
                    >
                      <span className="d-block text-danger fw-bold small lh-1">{monthStr}</span>
                      <span className="d-block fw-bold fs-4 text-dark mt-1 lh-1">{dayNum}</span>
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-bold text-dark mb-0">{h.name}</h6>
                        {h.isOptional && (
                          <span className="badge bg-secondary bg-opacity-25 text-dark" style={{ fontSize: '0.65rem' }}>
                            Optional
                          </span>
                        )}
                      </div>
                      <span className="text-muted small d-block">{weekday}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {h.description || 'Corporate Holiday'}
                      </span>
                    </div>
                  </div>

                  {isHR && (
                    <button
                      className="btn btn-sm btn-outline-danger p-1 px-2"
                      onClick={() => handleDelete(h._id, h.name)}
                      title="Delete Holiday"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Holiday Creation Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom px-4 pt-4 pb-2">
                <h5 className="modal-title fw-bold">Add Holiday</h5>
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
                    <label className="form-label small fw-semibold">Holiday Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Independence Day"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Holiday Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Context or celebration info..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="optSwitch"
                      checked={formData.isOptional}
                      onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="optSwitch">
                      Optional Floating Holiday
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
                    {saving ? 'Adding...' : 'Add to Calendar'}
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

export default HolidayManagementPage;

