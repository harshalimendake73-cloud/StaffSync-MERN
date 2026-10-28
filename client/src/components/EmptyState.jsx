import React from 'react';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="card-saas p-5 text-center my-3">
      {icon && <div className="display-5 text-muted mb-3 opacity-50">{icon}</div>}
      <h5 className="fw-semibold text-dark mb-1">{title}</h5>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

