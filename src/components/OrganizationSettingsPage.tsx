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
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Plus,
  Settings,
  Shield,
  Palette,
  BarChart3,
  Activity,
  Zap
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

// Navigation tabs configuration
const navigationTabs = [
  {
    id: 'overview',
    name: 'Overview',
    icon: BarChart3,
    description: 'Organization summary and key metrics'
  },
  {
    id: 'general',
    name: 'General Settings',
    icon: Settings,
    description: 'Basic organization information'
  },
  {
    id: 'branding',
    name: 'Branding',
    icon: Palette,
    description: 'Logo and visual identity'
  },
  {
    id: 'departments',
    name: 'Departments',
    icon: Building2,
    description: 'Manage organizational structure'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Access control and permissions'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Zap,
    description: 'Third-party connections'
  }
];

const OrganizationSettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<{ id: string; name: string; industry?: string; companySize?: string; logoUrl?: string } | null>(null);
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

  // Navigation state
  const [activeTab, setActiveTab] = useState('overview');

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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Organization Overview */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-4 mb-4">
                {logoPreview ? (
                  <div className="w-16 h-16 rounded-xl border-2 border-blue-200 overflow-hidden bg-white">
                    <img
                      src={logoPreview}
                      alt="Organization logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-blue-200 bg-white flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{organization.name}</h2>
                  <p className="text-gray-600">
                    {settings.industry && `${settings.industry} • `}
                    {settings.companySize && `${settings.companySize}`}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Departments</p>
                      <p className="text-xl font-bold text-blue-900">{departmentStats.totalDepartments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Active</p>
                      <p className="text-xl font-bold text-green-900">{departmentStats.activeDepartments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600">Employees</p>
                      <p className="text-xl font-bold text-purple-900">{departmentStats.totalEmployees}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('departments')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Departments</h3>
                    <p className="text-sm text-gray-500">Create and organize your team structure</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('branding')}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Update Branding</h3>
                    <p className="text-sm text-gray-500">Customize logo and visual identity</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Organization settings updated</span>
                  <span className="text-xs text-gray-400 ml-auto">Just now</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Department "QA" created</span>
                  <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
              <p className="text-sm text-gray-500 mb-6">
                Update your organization's basic information and details.
              </p>

              {/* Error and Success Messages */}
              {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2 mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2 mb-6">
                  <CheckCircle className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-6">
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
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Branding & Visual Identity</h3>
              <p className="text-sm text-gray-500 mb-6">
                Customize your organization's logo and visual appearance.
              </p>

              {/* Logo Upload */}
              <div className="space-y-6">
                {/* Current Logo Display */}
                {logoPreview && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Current Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload New Logo
                  </label>
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
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Department Management</h3>
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
                <h4 className="text-md font-medium text-gray-900 mb-3">Recent Departments</h4>
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
                            <h5 className="font-medium text-gray-900">{dept.name}</h5>
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
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Access Control</h3>
              <p className="text-sm text-gray-500 mb-6">
                Manage security settings and user permissions.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Organization Isolation</h4>
                      <p className="text-sm text-blue-700">Your data is completely isolated from other organizations</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Role-Based Access</h4>
                      <p className="text-sm text-green-700">Admin users have full access, regular users have limited access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Integrations</h3>
              <p className="text-sm text-gray-500 mb-6">
                Connect with third-party services and tools.
              </p>
              
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No integrations available yet</p>
                <p className="text-sm">Check back later for new integration options</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SideNavbar currentPage="organization-settings" />
      
      {/* Header */}
      <div className="ml-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
            <p className="text-gray-600 mt-2">Manage your organization's configuration and settings</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-20 flex">
        {/* Left Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-8">
          {renderTabContent()}
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
