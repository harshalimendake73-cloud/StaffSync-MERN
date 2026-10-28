import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getInitials, getRoleLabel } from '../utils/helpers';
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiLogOut,
  FiUser,
  FiCheck
} from 'react-icons/fi';

const TopNavbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const profile = user?.employeeProfile;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user?.email || 'User';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="app-topbar d-flex align-items-center justify-content-between px-3 px-lg-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 border-0"
          onClick={toggleMobileSidebar}
          aria-label="Toggle Navigation"
        >
          <FiMenu className="fs-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center position-relative">
          <FiSearch className="position-absolute text-muted ms-3 pointer-events-none" />
          <input
            type="text"
            className="form-control form-control-sm ps-5 rounded-pill bg-light border-0"
            style={{ width: '260px' }}
            placeholder="Search employee, ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="d-flex align-items-center gap-2">
        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative rounded-circle p-2 border-0"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title="Notifications"
          >
            <FiBell className="fs-5 text-muted" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="card-saas position-absolute end-0 mt-2 p-0 shadow-lg"
              style={{ width: '320px', zIndex: 1050 }}
            >
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                <span className="fw-bold small">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none small text-primary"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom small ${n.isRead ? 'bg-white' : 'bg-light'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n._id);
                        if (n.link) {
                          navigate(n.link);
                          setShowNotifications(false);
                        }
                      }}
                    >
                      <div className="d-flex align-items-start justify-content-between gap-1">
                        <strong className="text-dark">{n.title}</strong>
                        {!n.isRead && (
                          <span className="badge bg-primary rounded-circle p-1" />
                        )}
                      </div>
                      <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center border-top bg-light">
                <Link
                  to="/notifications"
                  className="small text-decoration-none fw-semibold text-primary"
                  onClick={() => setShowNotifications(false)}
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="position-relative">
          <div
            className="d-flex align-items-center gap-2 p-1 rounded-pill pe-3 bg-light cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{ width: '36px', height: '36px', backgroundColor: '#4F46E5', fontSize: '0.85rem' }}
            >
              {getInitials(fullName)}
            </div>
            <div className="d-none d-sm-block text-start">
              <span className="d-block fw-semibold text-dark small lh-1">{fullName}</span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          {showProfileMenu && (
            <div
              className="card-saas position-absolute end-0 mt-2 p-2 shadow-lg"
              style={{ width: '220px', zIndex: 1050 }}
            >
              <div className="px-3 py-2 border-bottom">
                <span className="fw-semibold text-dark d-block small">{fullName}</span>
                <span className="text-muted text-truncate d-block" style={{ fontSize: '0.75rem' }}>
                  {user?.email}
                </span>
                <span className="badge bg-secondary text-white mt-1 text-capitalize" style={{ fontSize: '0.68rem' }}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <Link
                to="/settings"
                className="dropdown-item py-2 px-3 small rounded d-flex align-items-center gap-2"
                onClick={() => setShowProfileMenu(false)}
              >
                <FiUser /> Account Settings
              </Link>
              <div className="dropdown-divider my-1" />
              <button
                className="dropdown-item py-2 px-3 small rounded text-danger d-flex align-items-center gap-2 border-0 bg-transparent w-100 text-start"
                onClick={handleLogout}
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;

