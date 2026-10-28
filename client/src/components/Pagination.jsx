import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between p-3 gap-2 border-top">
      <span className="text-muted small">
        Showing page <span className="fw-semibold text-dark">{page}</span> of{' '}
        <span className="fw-semibold text-dark">{totalPages}</span> ({total} items total)
      </span>
      <div className="btn-group">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <React.Fragment key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <button className="btn btn-outline-secondary btn-sm disabled" disabled>
                  ...
                </button>
              )}
              <button
                className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </React.Fragment>
          ))}
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

