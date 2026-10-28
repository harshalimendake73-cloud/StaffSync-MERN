import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { FiSliders, FiSave, FiCheckCircle } from 'react-icons/fi';

const LeavePolicyPage = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr_admin';

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/leave-policies');
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleUpdate = async (policy) => {
    try {
      setSavingType(policy.leaveType);
      setSuccess(null);
      await apiClient.post('/leave-policies', policy);
      setSuccess(`Updated ${policy.title || policy.leaveType} configuration successfully.`);
      fetchPolicies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update policy');
    } finally {
      setSavingType(null);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...policies];
    updated[index][field] = value;
    setPolicies(updated);
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Leave Quota & Governance Policies</h3>
          <p className="text-muted small mb-0">
            Define standard annual allowances, consecutive absence caps, and carry-forward rules.
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4">
          <FiCheckCircle className="fs-5" /> {success}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading leave policies..." />
      ) : (
        <div className="d-flex flex-column gap-4">
          {policies.map((pol, idx) => (
            <div key={pol._id || pol.leaveType} className="card-saas p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div>
                  <h5 className="fw-bold text-dark mb-0 text-capitalize">
                    {pol.title || `${pol.leaveType} Leave`}
                  </h5>
                  <span className="text-muted small">Category: {pol.leaveType}</span>
                </div>
                {isHR && (
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
                    disabled={savingType === pol.leaveType}
                    onClick={() => handleUpdate(pol)}
                  >
                    <FiSave /> {savingType === pol.leaveType ? 'Saving...' : 'Save Policy'}
                  </button>
                )}
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Annual Allocation (Days)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={pol.annualQuota}
                    disabled={!isHR}
                    onChange={(e) =>
                      handleFieldChange(idx, 'annualQuota', parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Max Consecutive Days</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={pol.maxConsecutiveDays}
                    disabled={!isHR}
                    onChange={(e) =>
                      handleFieldChange(idx, 'maxConsecutiveDays', parseInt(e.target.value, 10) || 1)
                    }
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Max Carry Forward</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={pol.carryForwardMax}
                    disabled={!isHR}
                    onChange={(e) =>
                      handleFieldChange(idx, 'carryForwardMax', parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold">Proof Required After (Days)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={pol.requiresProofDays}
                    disabled={!isHR}
                    onChange={(e) =>
                      handleFieldChange(idx, 'requiresProofDays', parseInt(e.target.value, 10) || 0)
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Governance Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={pol.description || ''}
                    disabled={!isHR}
                    onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeavePolicyPage;

