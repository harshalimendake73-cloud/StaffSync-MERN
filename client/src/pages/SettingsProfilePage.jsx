import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiSave, FiCheckCircle, FiShield } from 'react-icons/fi';

const SettingsProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const profile = user?.employeeProfile;

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    address: {
      street: profile?.address?.street || '',
      city: profile?.address?.city || '',
      state: profile?.address?.state || '',
      postalCode: profile?.address?.postalCode || '',
      country: profile?.address?.country || 'USA'
    },
    emergencyContact: {
      name: profile?.emergencyContact?.name || '',
      relationship: profile?.emergencyContact?.relationship || '',
      phone: profile?.emergencyContact?.phone || ''
    }
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          postalCode: profile.address?.postalCode || '',
          country: profile.address?.country || 'USA'
        },
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          relationship: profile.emergencyContact?.relationship || '',
          phone: profile.emergencyContact?.phone || ''
        }
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await apiClient.patch(`/employees/${profile._id}`, profileForm);
      updateUserProfile(res.data.data);
      setProfileSuccess('Personal details updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update personal details');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setSavingPassword(true);
    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Your password has been changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ maxWidth: '960px' }}>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-1">Account & Profile Settings</h3>
        <p className="text-muted small mb-0">
          Manage your personal contact details, residential address, emergency points, and authentication security.
        </p>
      </div>

      <div className="row g-4">
        {/* Personal Details Form */}
        <div className="col-12 col-lg-7">
          <div className="card-saas p-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiUser className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">Personal Contact Information</h5>
            </div>

            {profileSuccess && (
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
                <FiCheckCircle /> {profileSuccess}
              </div>
            )}
            {profileError && <div className="alert alert-danger py-2 small">{profileError}</div>}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lastName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Work Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
                />
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Work email is managed by your organization's IT department.
                </span>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Direct Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="pt-2 border-top mb-3">
                <label className="form-label small fw-semibold d-block">Residential Street Address</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Street and Apt/Suite"
                  value={profileForm.address.street}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      address: { ...profileForm.address, street: e.target.value }
                    })
                  }
                />
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City"
                      value={profileForm.address.city}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address: { ...profileForm.address, city: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Postal Code"
                      value={profileForm.address.postalCode}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          address: { ...profileForm.address, postalCode: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-top mb-4">
                <label className="form-label small fw-semibold d-block">Emergency Contact Information</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contact Name"
                      value={profileForm.emergencyContact.name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          emergencyContact: {
                            ...profileForm.emergencyContact,
                            name: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phone"
                      value={profileForm.emergencyContact.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          emergencyContact: {
                            ...profileForm.emergencyContact,
                            phone: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-1 shadow-sm"
                disabled={savingProfile}
              >
                <FiSave /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Security Form */}
        <div className="col-12 col-lg-5">
          <div className="card-saas p-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FiLock className="text-primary fs-5" />
              <h5 className="fw-bold mb-0">Change Password</h5>
            </div>

            {passwordSuccess && (
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
                <FiCheckCircle /> {passwordSuccess}
              </div>
            )}
            {passwordError && <div className="alert alert-danger py-2 small">{passwordError}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 shadow-sm"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfilePage;

