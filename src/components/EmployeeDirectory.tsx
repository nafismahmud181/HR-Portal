import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Eye, ChevronLeft, ChevronRight, Users, Trash2 } from 'lucide-react';
import SideNavbar from './SideNavbar';
import AddEmployeeModal from './AddEmployeeModal';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import { employeeService, type Employee, type EmployeeFilters } from '../services/employeeService';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(8);

  const [filters, setFilters] = useState<EmployeeFilters>({
    searchTerm: '',
    department: 'All Departments',
    role: 'All Roles',
    status: 'All Statuses'
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    loadEmployees();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, employees]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const fetchedEmployees = await employeeService.getEmployees();
      setEmployees(fetchedEmployees);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employees';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [fetchedDepartments, fetchedRoles] = await Promise.all([
        employeeService.getDepartments(),
        employeeService.getRoles()
      ]);
      setDepartments(fetchedDepartments);
      setRoles(fetchedRoles);
    } catch {
      // Silently fail for filter options
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower) ||
        employee.role.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (filters.department && filters.department !== 'All Departments') {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }

    // Apply role filter
    if (filters.role && filters.role !== 'All Roles') {
      filtered = filtered.filter(employee => employee.role === filters.role);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'All Statuses') {
      filtered = filtered.filter(employee => employee.status === filters.status);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      department: 'All Departments',
      role: 'All Roles',
      status: 'All Statuses'
    });
  };

  const handleEmployeeAdded = () => {
    loadEmployees();
    loadFilterOptions();
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);
      await employeeService.deleteEmployee(employeeToDelete.id!);
      
      // Close modal and refresh data
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      loadEmployees();
      loadFilterOptions();
      
      // Show success message
      setSuccessMessage(`Employee "${employeeToDelete.firstName} ${employeeToDelete.lastName}" has been deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 5000); // Auto-hide after 5 seconds
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-blue-100 text-blue-800';
      case 'Working Remotely':
        return 'bg-gray-100 text-gray-800';
      case 'On Leave':
        return 'bg-red-100 text-red-800';
      case 'Terminated':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Pagination
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <SideNavbar currentPage="employees" />
        <div className="ml-20 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading employees...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SideNavbar currentPage="employees" />
      
      <div className="ml-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
            <p className="text-gray-600 mt-2">Manage and view all employees in your organization</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Departments">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Roles">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Working Remotely">Working Remotely</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

              {/* Add Employee Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Employee Grid */}
          {currentEmployees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-6">
                {filters.searchTerm || filters.department !== 'All Departments' || filters.role !== 'All Roles' || filters.status !== 'All Statuses'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first employee.'}
              </p>
              {!filters.searchTerm && filters.department === 'All Departments' && filters.role === 'All Roles' && filters.status === 'All Statuses' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Employee
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {currentEmployees.map((employee) => (
                  <div key={employee.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      {employee.imageUrl ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-gray-200 shadow-md">
                          <img src={employee.imageUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 ${employee.avatarColor || 'bg-blue-200'}`}>
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                      )}
                    </div>

                    {/* Employee Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm">{employee.role}</p>
                    </div>

                    {/* Status */}
                    <div className="text-center mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>

                    {/* Department */}
                    <div className="text-center mb-4">
                      <p className="text-gray-500 text-sm">{employee.department}</p>
                    </div>

                    {/* Action Icons */}
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => window.location.href = `mailto:${employee.email}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Implement view details */}}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeAdded={handleEmployeeAdded}
      />

      {/* Delete Employee Modal */}
      <DeleteEmployeeModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        employee={employeeToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default EmployeeDirectory;
