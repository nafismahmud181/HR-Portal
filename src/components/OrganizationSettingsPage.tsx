import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationService } from '../services/organizationService';
import { StorageService } from '../services/storageService';
import { departmentService, type Department } from '../services/departmentService';
import {
  Building2,
  Users,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideNavbar from './SideNavbar';
import DepartmentManagementModal from './DepartmentManagementModal';

interface OrganizationSettings {
  industry: string;
  companySize: string;
  logoUrl?: string;
}

const companySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Real Estate',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Other'
];

const OrganizationSettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [settings, setSettings] = useState<OrganizationSettings>({
    industry: '',
    companySize: '',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Department management state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentStats, setDepartmentStats] = useState({
    totalDepartments: 0,
    activeDepartments: 0,
    totalEmployees: 0
  });

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      if (!currentUser) {
        console.log('No current user, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('Loading organization data for user:', currentUser.uid);
      console.log('User email:', currentUser.email);
      console.log('User display name:', currentUser.displayName);

      // Get user's organization
      const orgData = await OrganizationService.getUserOrganization(currentUser.uid);
      console.log('Organization data received:', orgData);
      
      if (orgData) {
        console.log('Setting organization data:', orgData);
        setOrganization(orgData);
        setSettings({
          industry: orgData.industry || '',
          companySize: orgData.companySize || '',
          logoUrl: orgData.logoUrl || ''
        });
        if (orgData.logoUrl) {
          setLogoPreview(orgData.logoUrl);
        }

        // Load departments
        await loadDepartments();
      } else {
        console.log('No organization data found for user');
        setError('No organization found. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
      setError('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    if (!currentUser) return;
    
    try {
      const [deptList, stats] = await Promise.all([
        departmentService.getDepartments(currentUser.uid),
        departmentService.getDepartmentStats(currentUser.uid)
      ]);
      
      setDepartments(deptList);
      setDepartmentStats(stats);
    } catch (error) {
      console.error('Error loading departments:', error);
      // Don't set error here as it's not critical for the main page
    }
  };

  const handleInputChange = (field: keyof OrganizationSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!currentUser || !organization) {
        setError('Organization data not found');
        return;
      }

      let logoUrl = settings.logoUrl;

             // Upload new logo if selected
       if (logoFile) {
         const logoPath = `organizations/${organization.id}/logos/${Date.now()}_${logoFile.name}`;
         logoUrl = await StorageService.uploadFile(logoPath, logoFile);
        
        // Delete old logo if it exists
        if (settings.logoUrl && settings.logoUrl !== logoUrl) {
          try {
            await StorageService.deleteFile(settings.logoUrl);
          } catch (deleteError) {
            console.warn('Failed to delete old logo:', deleteError);
          }
        }
      }

      // Update organization settings
      await OrganizationService.updateOrganization(organization.id, {
        industry: settings.industry,
        companySize: settings.companySize,
        logoUrl
      });

      setSuccess('Organization settings updated successfully!');
      setSettings(prev => ({ ...prev, logoUrl }));
      setLogoFile(null);
      
      // Reload organization data
      await loadOrganizationData();
    } catch (error) {
      console.error('Error saving organization settings:', error);
      setError('Failed to save organization settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load organization data.</p>
          <button
            onClick={() => navigate('/templates')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNavbar currentPage="organization-settings" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b ml-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/templates')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Organization Settings</h1>
                <p className="text-sm text-gray-500">{organization.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">General Information</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update your organization's basic information and branding.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </div>
            )}

            {/* Organization Name (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={organization.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Organization name cannot be changed</p>
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="industry"
                  value={settings.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Size */}
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="companySize"
                  value={settings.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select company size</option>
                  {companySizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Logo
              </label>
              
              {/* Current Logo Display */}
              {logoPreview && (
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Organization logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <ImageIcon className="w-8 h-8 text-gray-400 hidden" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current logo</p>
                      <p className="text-xs text-gray-500">Click "Choose File" to replace</p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {logoFile && (
                  <span className="text-sm text-gray-600">
                    Selected: {logoFile.name}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Recommended: Square image, max 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Department Management Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Department Management</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Create and manage departments within your organization.
                </p>
              </div>
              <button
                onClick={() => setShowDepartmentModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Departments</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Department Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Departments</p>
                    <p className="text-2xl font-bold text-blue-900">{departmentStats.totalDepartments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Departments</p>
                    <p className="text-2xl font-bold text-green-900">{departmentStats.activeDepartments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Employees</p>
                    <p className="text-2xl font-bold text-purple-900">{departmentStats.totalEmployees}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department List Preview */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Recent Departments</h3>
              {departments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No departments created yet</p>
                  <p className="text-sm">Click "Manage Departments" to create your first department</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {departments.slice(0, 3).map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color || '#3B82F6' }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{dept.name}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{dept.employeeCount} employees</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              dept.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {dept.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {departments.length > 3 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      <p>Showing 3 of {departments.length} departments</p>
                      <p>Click "Manage Departments" to see all</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Department Management Modal */}
      <DepartmentManagementModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onRefresh={loadDepartments}
        departments={departments}
        userId={currentUser?.uid || ''}
      />
    </div>
  );
};

export default OrganizationSettingsPage;
