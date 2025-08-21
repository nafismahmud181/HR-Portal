import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Users, 
  Building2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { departmentService, type Department, type CreateDepartmentData, type UpdateDepartmentData } from '../services/departmentService';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  departments: Department[];
  userId: string;
}

type ModalMode = 'list' | 'create' | 'edit';

const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({
  isOpen,
  onClose,
  onRefresh,
  departments,
  userId
}) => {
  const [mode, setMode] = useState<ModalMode>('list');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateDepartmentData>({
    name: '',
    description: '',
    managerId: '',
    managerName: '',
    color: '#3B82F6' // Default blue color
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    description: ''
  });

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  useEffect(() => {
    if (isOpen) {
      setMode('list');
      setSelectedDepartment(null);
      setError(null);
      setSuccess(null);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      managerId: '',
      managerName: '',
      color: '#3B82F6'
    });
    setValidationErrors({
      name: '',
      description: ''
    });
  };

  const validateForm = (): boolean => {
    const errors = {
      name: '',
      description: ''
    };

    if (!formData.name.trim()) {
      errors.name = 'Department name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Department name must be at least 2 characters';
    }

    if (formData.description && formData.description.trim().length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  const handleCreateDepartment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if department name already exists (but don't block if check fails)
      try {
        const nameExists = await departmentService.isDepartmentNameExists(formData.name, userId);
        if (nameExists) {
          setError('A department with this name already exists');
          return;
        }
      } catch (nameCheckError) {
        console.warn('Could not verify department name uniqueness:', nameCheckError);
        // Continue with creation even if name check fails
      }

      await departmentService.createDepartment(formData, userId);
      setSuccess('Department created successfully!');
      resetForm();
      setMode('list');
      onRefresh();
    } catch (err) {
      console.error('Error creating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment || !validateForm()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if department name already exists (excluding current department)
      try {
        const nameExists = await departmentService.isDepartmentNameExists(formData.name, userId, selectedDepartment.id);
        if (nameExists) {
          setError('A department with this name already exists');
          return;
        }
      } catch (nameCheckError) {
        console.warn('Could not verify department name uniqueness:', nameCheckError);
        // Continue with update even if name check fails
      }

      const updateData: UpdateDepartmentData = {
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId,
        managerName: formData.managerName,
        color: formData.color
      };

      await departmentService.updateDepartment(selectedDepartment.id!, updateData, userId);
      setSuccess('Department updated successfully!');
      resetForm();
      setMode('list');
      setSelectedDepartment(null);
      onRefresh();
    } catch (err) {
      console.error('Error updating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`Are you sure you want to delete the department "${department.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await departmentService.deleteDepartment(department.id!, userId);
      setSuccess('Department deleted successfully!');
      onRefresh();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.managerId || '',
      managerName: department.managerName || '',
      color: department.color || '#3B82F6'
    });
    setMode('edit');
    setError(null);
    setSuccess(null);
  };

  const handleCreateClick = () => {
    setMode('create');
    resetForm();
    setError(null);
    setSuccess(null);
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedDepartment(null);
    resetForm();
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'list' && 'Department Management'}
              {mode === 'create' && 'Create New Department'}
              {mode === 'edit' && 'Edit Department'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'list' && (
            <div className="space-y-4">
              {/* Department List */}
              <div className="space-y-3">
                {departments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No departments created yet</p>
                    <p className="text-sm">Create your first department to get started</p>
                  </div>
                ) : (
                  departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: dept.color || '#3B82F6' }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{dept.name}</h3>
                          {dept.description && (
                            <p className="text-sm text-gray-500">{dept.description}</p>
                          )}
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit department"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          disabled={dept.employeeCount > 0}
                          className={`p-2 rounded-lg transition-colors ${
                            dept.employeeCount > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={dept.employeeCount > 0 ? 'Cannot delete department with employees' : 'Delete department'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateClick}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Department</span>
              </button>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter department name"
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-gray-300"
                      style={{ backgroundColor: formData.color }}
                    />
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color === '#3B82F6' ? 'Blue' :
                           color === '#10B981' ? 'Green' :
                           color === '#F59E0B' ? 'Yellow' :
                           color === '#EF4444' ? 'Red' :
                           color === '#8B5CF6' ? 'Purple' :
                           color === '#F97316' ? 'Orange' :
                           color === '#06B6D4' ? 'Cyan' :
                           color === '#84CC16' ? 'Lime' :
                           color === '#EC4899' ? 'Pink' :
                           color === '#6B7280' ? 'Gray' : color}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter department description (optional)"
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description?.length || 0}/200 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager ID
                  </label>
                  <input
                    type="text"
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter manager ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Name
                  </label>
                  <input
                    type="text"
                    value={formData.managerName}
                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter manager name (optional)"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={mode === 'create' ? handleCreateDepartment : handleEditDepartment}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{mode === 'create' ? 'Create Department' : 'Update Department'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementModal;
