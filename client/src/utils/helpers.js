export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '—';
  }
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 hrs';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const getRoleLabel = (role) => {
  switch (role) {
    case 'hr_admin':
      return 'HR Administrator';
    case 'manager':
      return 'Team Manager';
    case 'employee':
      return 'Employee';
    default:
      return role || 'Staff';
  }
};

export const getInitials = (nameOrEmail) => {
  if (!nameOrEmail) return 'SS';
  const parts = nameOrEmail.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameOrEmail.substring(0, 2).toUpperCase();
};

