import React from 'react';

const StatCard = ({ title, value, icon, iconBg = '#EEF2FF', iconColor = '#4F46E5', subtitle, trend }) => {
  return (
    <div className="card-saas p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-muted small fw-semibold text-uppercase tracking-wider">
          {title}
        </span>
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="d-flex align-items-baseline gap-2">
        <h3 className="mb-0 fw-bold">{value}</h3>
        {trend && (
          <span className={`small fw-semibold ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-muted small mb-0 mt-2">{subtitle}</p>}
    </div>
  );
};

export default StatCard;

