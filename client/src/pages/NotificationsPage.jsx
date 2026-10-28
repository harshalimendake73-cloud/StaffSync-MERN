import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '840px' }}>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-1">Notifications & System Alerts</h3>
          <p className="text-muted small mb-0">
            Real-time updates regarding leave approvals, attendance alerts, training enrollments, and bulletins.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
            onClick={markAllAsRead}
          >
            <FiCheckCircle /> Mark All as Read
          </button>
        )}
      </div>

      <div className="card-saas overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<FiBell />}
            title="All Caught Up!"
            description="You have no notifications or unread alerts right now."
          />
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`list-group-item p-3 d-flex align-items-start justify-content-between gap-3 ${
                  n.isRead ? 'bg-white' : 'bg-light'
                }`}
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong className="text-dark small">{n.title}</strong>
                    <span className="badge bg-secondary bg-opacity-10 text-dark text-capitalize" style={{ fontSize: '0.68rem' }}>
                      {n.type}
                    </span>
                    {!n.isRead && (
                      <span className="badge bg-primary" style={{ fontSize: '0.62rem' }}>
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-1">{n.message}</p>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {formatDate(n.createdAt)}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {n.link && (
                    <Link to={n.link} className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>
                      View
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      className="btn btn-sm btn-light border py-1 px-2"
                      title="Mark as read"
                      onClick={() => markAsRead(n._id)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <FiCheck />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

