import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';
import { FiBookOpen, FiAward, FiCheck, FiSliders, FiArrowRight } from 'react-icons/fi';

const TrainingEnrollmentPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/trainings/my/enrollments');
      setEnrollments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleProgressUpdate = async (trainingId, newPercent) => {
    try {
      setUpdatingId(trainingId);
      await apiClient.patch(`/trainings/${trainingId}/progress`, {
        progressPercent: newPercent
      });
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">My Enrolled Trainings & Progress</h3>
          <p className="text-muted small mb-0">
            Self-paced progress tracking, syllabus milestones, and completion certificates.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading course enrollments..." />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen />}
          title="No Course Enrollments Found"
          description="You are not enrolled in any training programs yet. Explore the company training catalog to enroll."
        />
      ) : (
        <div className="d-flex flex-column gap-4">
          {enrollments.map((enr) => {
            const t = enr.training;
            if (!t) return null;
            const isCompleted = enr.progressPercent === 100 || enr.status === 'completed';

            return (
              <div key={enr._id} className="card-saas p-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-indigo-subtle text-primary border border-primary border-opacity-25">
                      {t.department?.name || 'General Program'}
                    </span>
                    <StatusBadge status={enr.status} />
                  </div>
                  <span className="text-muted small">
                    Enrolled on {formatDate(enr.enrolledAt)}
                  </span>
                </div>

                <h5 className="fw-bold text-dark mb-2">{t.title}</h5>
                <p className="text-secondary small mb-3">{t.description}</p>

                <div className="row g-2 p-3 bg-light rounded-3 mb-3 small">
                  <div className="col-12 col-sm-4">
                    <span className="text-muted d-block">Lead Instructor:</span>
                    <strong className="text-dark">{t.instructor}</strong>
                  </div>
                  <div className="col-12 col-sm-4">
                    <span className="text-muted d-block">Duration:</span>
                    <strong className="text-dark">{t.durationHours} Hours</strong>
                  </div>
                  <div className="col-12 col-sm-4">
                    <span className="text-muted d-block">Current Completion:</span>
                    <strong className="text-primary fs-6">{enr.progressPercent}%</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                      role="progressbar"
                      style={{ width: `${enr.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone update buttons */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
                  <span className="small text-muted fw-semibold">Quick Progress Milestone:</span>
                  <div className="btn-group btn-group-sm">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        className={`btn ${enr.progressPercent === pct ? 'btn-primary' : 'btn-outline-secondary'}`}
                        disabled={updatingId === t._id}
                        onClick={() => handleProgressUpdate(t._id, pct)}
                      >
                        {pct === 100 ? '100% (Complete)' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingEnrollmentPage;

