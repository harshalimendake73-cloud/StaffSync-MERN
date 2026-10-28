import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import StatusBadge from './StatusBadge';
import { formatTime, formatDuration } from '../utils/helpers';
import { FiClock, FiCheckCircle, FiLogOut, FiMoon } from 'react-icons/fi';

const AttendanceWidget = ({ onAttendanceUpdated }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOvernight, setIsOvernight] = useState(false);
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState(null);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/attendance/me');
      setSession(res.data.data.today);
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Live timer tick when active session (checked in, not checked out)
  useEffect(() => {
    let timer = null;
    if (session && session.checkIn && !session.checkOut) {
      const startMs = new Date(session.checkIn).getTime();
      const updateElapsed = () => {
        const nowMs = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
      };
      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session]);

  const handleCheckIn = async () => {
    try {
      setSubmitting(true);
      setAlert(null);
      const res = await apiClient.post('/attendance/check-in', {
        isOvernight,
        notes
      });
      setSession(res.data.data);
      setAlert({ type: 'success', message: 'Checked in successfully!' });
      if (onAttendanceUpdated) onAttendanceUpdated(res.data.data);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Check-in failed. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setSubmitting(true);
      setAlert(null);
      const res = await apiClient.patch('/attendance/check-out', { notes });
      setSession(res.data.data);
      setAlert({ type: 'success', message: 'Checked out successfully!' });
      if (onAttendanceUpdated) onAttendanceUpdated(res.data.data);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Check-out failed. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimerDigits = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card-saas p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <FiClock className="text-primary fs-5" />
          <h5 className="mb-0 fw-bold">Daily Attendance Clock</h5>
        </div>
        {session && <StatusBadge status={session.status} />}
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show py-2 small`} role="alert">
          {alert.message}
          <button type="button" className="btn-close py-2" onClick={() => setAlert(null)} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
          <span className="ms-2 text-muted small">Loading status...</span>
        </div>
      ) : (
        <div>
          {/* Status Overview Banner */}
          <div className="p-3 bg-light rounded-3 mb-3 text-center">
            {!session && (
              <div>
                <p className="text-muted small mb-1">You haven't checked in for today yet.</p>
                <span className="badge bg-secondary text-white">Not Checked In</span>
              </div>
            )}
            {session && !session.checkOut && (
              <div>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <span className="pulse-indicator" />
                  <span className="text-success fw-semibold small">Active Session</span>
                </div>
                <div className="display-6 fw-bold text-dark font-monospace">
                  {formatTimerDigits(elapsedSeconds)}
                </div>
                <div className="text-muted small mt-1">
                  Checked in at: <span className="fw-medium text-dark">{formatTime(session.checkIn)}</span>
                </div>
              </div>
            )}
            {session && session.checkOut && (
              <div>
                <div className="text-success fw-bold d-flex align-items-center justify-content-center gap-1 mb-1">
                  <FiCheckCircle /> Work Session Completed
                </div>
                <h4 className="fw-bold mb-1 text-dark">
                  {formatDuration(session.durationMinutes)}
                </h4>
                <div className="text-muted small">
                  In: {formatTime(session.checkIn)} &bull; Out: {formatTime(session.checkOut)}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!session && (
            <div>
              <div className="form-check form-switch mb-3 small">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="overnightShiftSwitch"
                  checked={isOvernight}
                  onChange={(e) => setIsOvernight(e.target.checked)}
                />
                <label className="form-check-label text-muted d-flex align-items-center gap-1" htmlFor="overnightShiftSwitch">
                  <FiMoon className="text-warning" /> Overnight Shift (spanning into tomorrow)
                </label>
              </div>

              <button
                className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
                onClick={handleCheckIn}
              >
                <FiClock /> {submitting ? 'Checking in...' : 'Check In Now'}
              </button>
            </div>
          )}

          {session && !session.checkOut && (
            <div>
              <button
                className="btn btn-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={submitting}
                onClick={handleCheckOut}
              >
                <FiLogOut /> {submitting ? 'Checking out...' : 'Check Out Now'}
              </button>
            </div>
          )}

          {session && session.checkOut && (
            <p className="text-muted text-center small mb-0">
              Your workday session is complete. Next check-in will open on the next workday cycle.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget;

