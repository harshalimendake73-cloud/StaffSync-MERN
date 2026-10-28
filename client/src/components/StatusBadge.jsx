import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/ /g, '_');
  const displayLabel = status.replace(/_/g, ' ');

  return (
    <span className={`badge-status badge-${normalized}`}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {displayLabel}
    </span>
  );
};

export default StatusBadge;

