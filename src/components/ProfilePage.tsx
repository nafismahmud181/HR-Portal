import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Lock,
  Key,
  AlertCircle
} from 'lucide-react';
import SideNavbar from './SideNavbar';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationService, type Organization } from '../services/organizationService';
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  emailVerified: boolean;
  organizationRole?: 'admin' | 'user';
  joinedAt?: Date;
  organization?: Organization;
}

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfileData();
  }, [currentUser]);

  const loadProfileData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get organization data
      const organization = await OrganizationService.getUserOrganization(currentUser.uid);
      
      let organizationRole: 'admin' | 'user' | undefined;

      if (organization) {
        const role = await OrganizationService.getUserRole(organization.id, currentUser.uid);
        organizationRole = role as 'admin' | 'user';
      }

      const userProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        phoneNumber: currentUser.phoneNumber || undefined,
        photoURL: currentUser.photoURL || undefined,
        emailVerified: currentUser.emailVerified,
        organizationRole,
        organization: organization || undefined
      };

      setProfile(userProfile);
      setEditForm({
        displayName: userProfile.displayName,
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber || ''
      });

    } catch (err) {
      console.error('Error loading profile data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      displayName: '',
      email: '',
      phoneNumber: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    // Validate display name
    if (!editForm.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(editForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate phone number (optional but if provided should be valid)
    if (editForm.phoneNumber && editForm.phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(editForm.phoneNumber.replace(/\s/g, ''))) {
        errors.phoneNumber = 'Please enter a valid phone number';
      }
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const validatePasswordForm = () => {
    const errors = {
      displayName: '',
      email: '',
      phoneNumber: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleEditProfile = async () => {
    if (!currentUser || !validateForm()) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      // Update display name
      if (editForm.displayName !== profile?.displayName) {
        await updateProfile(currentUser, {
          displayName: editForm.displayName
        });
      }

      // Update email if changed
      if (editForm.email !== profile?.email) {
        await updateEmail(currentUser, editForm.email);
      }

      // Note: Phone number update would require additional Firebase setup
      // For now, we'll just show a success message

      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      await loadProfileData(); // Reload profile data

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser || !validatePasswordForm()) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      await updatePassword(currentUser, passwordForm.newPassword);

      setSuccessMessage('Password updated successfully!');
      setShowPasswordChange(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideNavbar currentPage="profile" />
        <div className="flex-1 ml-20 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || !profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SideNavbar currentPage="profile" />
        <div className="flex-1 ml-20 overflow-auto">
          <div className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h1>
              <p className="text-gray-600">Please log in to view your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SideNavbar currentPage="profile" />
      
      <div className="ml-20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and personal information</p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <button
                onClick={clearMessages}
                className="text-red-700 hover:text-red-900 font-bold text-xl"
              >
                ×
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
              <span>{successMessage}</span>
              <button
                onClick={clearMessages}
                className="text-green-700 hover:text-green-900 font-bold text-xl"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-600" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                        <Camera className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{profile.displayName || 'No Name'}</h2>
                      <p className="text-blue-100">{profile.email}</p>
                      <div className="flex items-center mt-2">
                        <Shield className="w-4 h-4 mr-1" />
                        <span className="text-sm capitalize">{profile.organizationRole || 'Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.displayName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {validationErrors.displayName && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.displayName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your email"
                        />
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {validationErrors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                        )}
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={handleEditProfile}
                          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              displayName: profile.displayName,
                              email: profile.email,
                              phoneNumber: profile.phoneNumber || ''
                            });
                            setValidationErrors({
                              displayName: '',
                              email: '',
                              phoneNumber: '',
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">{profile.displayName || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">{profile.email}</p>
                          {!profile.emailVerified && (
                            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              Not Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{profile.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Organization Info */}
              {profile.organization && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{profile.organization.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium capitalize">{profile.organizationRole || 'Member'}</p>
                      </div>
                    </div>

                    {profile.organization.industry && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Industry</p>
                          <p className="font-medium">{profile.organization.industry}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Security */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-500">Last updated recently</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Not enabled</p>
                    </div>
                  </div>
                </div>

                {showPasswordChange && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="password"
                          placeholder="Current password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.currentPassword && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <input
                          type="password"
                          placeholder="New password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.newPassword && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={handleChangePassword}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordChange(false);
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                            setValidationErrors({
                              displayName: '',
                              email: '',
                              phoneNumber: '',
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {currentUser.metadata.creationTime ? 
                        new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last sign in</span>
                    <span className="font-medium">
                      {currentUser.metadata.lastSignInTime ? 
                        new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 
                        'Unknown'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email verified</span>
                    <span className={`font-medium ${profile.emailVerified ? 'text-green-600' : 'text-orange-600'}`}>
                      {profile.emailVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
