import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../src/components/StatusBadge';
import StatCard from '../src/components/StatCard';
import { FiUsers } from 'react-icons/fi';

describe('StaffSync Frontend Component Unit Tests', () => {
  it('StatusBadge renders correct status class and text', () => {
    const { container } = render(<StatusBadge status="present" />);
    expect(screen.getByText('present')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('badge-present');
  });

  it('StatusBadge handles multi-word status like half_day', () => {
    const { container } = render(<StatusBadge status="half_day" />);
    expect(screen.getByText('half day')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('badge-half_day');
  });

  it('StatCard renders title, value and subtitle properly', () => {
    render(
      <StatCard
        title="Total Active Staff"
        value={42}
        icon={<FiUsers data-testid="users-icon" />}
        subtitle="Registered active workforce"
      />
    );

    expect(screen.getByText('Total Active Staff')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Registered active workforce')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });
});

