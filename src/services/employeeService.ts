import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { firestore as db } from '../firebase/config';
import { OrganizationService } from './organizationService';

export interface Employee {
  id?: string;
  organizationId: string; // NEW: Organization isolation
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: 'Available' | 'Working Remotely' | 'On Leave' | 'Terminated';
  hireDate: string;
  salary: string;
  manager?: string;
  location: string;
  avatarColor?: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EmployeeFilters {
  searchTerm: string;
  department: string;
  role: string;
  status: string;
}

class EmployeeService {
  private collectionName = 'employees';

  async addEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization to ensure employee is added to correct organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // CRITICAL: Log the organization context for debugging
      console.log('🔍 ADD EMPLOYEE DEBUG:');
      console.log('  - Current User ID:', userId);
      console.log('  - User Organization ID:', userOrg.id);
      console.log('  - User Organization Name:', userOrg.name);
      console.log('  - Employee Data Received:', employeeData);

      // Ensure organizationId is set correctly
      if (employeeData.organizationId && employeeData.organizationId !== userOrg.id) {
        console.error('❌ SECURITY VIOLATION: Attempting to add employee to different organization!');
        console.error('  - Requested organizationId:', employeeData.organizationId);
        console.error('  - User organizationId:', userOrg.id);
        throw new Error('Cannot add employee to different organization');
      }

      const now = Timestamp.now();
      const employeeWithTimestamps = {
        ...employeeData,
        organizationId: userOrg.id, // Ensure correct organization
        createdAt: now,
        updatedAt: now,
        avatarColor: this.generateAvatarColor()
      };

      // Log the final employee data being saved
      console.log('✅ FINAL EMPLOYEE DATA TO SAVE:');
      console.log('  - organizationId:', employeeWithTimestamps.organizationId);
      console.log('  - firstName:', employeeWithTimestamps.firstName);
      console.log('  - lastName:', employeeWithTimestamps.lastName);
      console.log('  - email:', employeeWithTimestamps.email);
      console.log('  - createdAt:', employeeWithTimestamps.createdAt.toDate());
      console.log('  - updatedAt:', employeeWithTimestamps.updatedAt.toDate());

      const docRef = await addDoc(collection(this.db, this.collectionName), employeeWithTimestamps);
      
      // Log the successful creation
      console.log('🎉 EMPLOYEE CREATED SUCCESSFULLY:');
      console.log('  - Document ID:', docRef.id);
      console.log('  - Organization ID:', employeeWithTimestamps.organizationId);
      console.log('  - Employee Name:', `${employeeWithTimestamps.firstName} ${employeeWithTimestamps.lastName}`);
      console.log('  - Firestore Path:', `employees/${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        }
      }
      throw new Error('Failed to add employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getEmployees(userId: string, filters: EmployeeFilters = { searchTerm: '', department: '', role: '', status: '' }): Promise<Employee[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization to filter employees
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // CRITICAL: Build the query with ALL where clauses first, then orderBy
      const whereClauses = [
        where('organizationId', '==', userOrg.id),
        ...(filters.department && filters.department !== 'All Departments' ? [where('department', '==', filters.department)] : []),
        ...(filters.role && filters.role !== 'All Roles' ? [where('role', '==', filters.role)] : []),
        ...(filters.status && filters.status !== 'All Statuses' ? [where('status', '==', filters.status)] : [])
      ];
      
      // SECURITY: Log the query being executed for debugging
      console.log(`Executing employee query for organization: ${userOrg.id}`);
      console.log(`Number of where clauses: ${whereClauses.length}`);
      console.log(`Filters applied:`, { department: filters.department, role: filters.role, status: filters.status });
      
      // Create the query with all where clauses first, then orderBy
      const q = query(
        collection(this.db, this.collectionName),
        ...whereClauses,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const employees: Employee[] = [];

      querySnapshot.forEach((doc) => {
        const employeeData = doc.data() as Employee;
        // CRITICAL: Double-check organization isolation and log any violations
        if (!employeeData.organizationId) {
          console.warn(`Employee ${doc.id} missing organizationId - skipping for security`);
          return; // Skip this document
        }
        if (employeeData.organizationId === userOrg.id) {
          employees.push({
            id: doc.id,
            ...employeeData
          });
        } else {
          console.warn(`SECURITY VIOLATION: Employee ${doc.id} belongs to organization ${employeeData.organizationId} but user is from ${userOrg.id}`);
        }
      });

      // Apply search filter on client side for better performance
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return employees.filter(employee => 
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
          employee.email.toLowerCase().includes(searchLower) ||
          employee.role.toLowerCase().includes(searchLower)
        );
      }

      return employees;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        } else if (error.message.includes('indexes')) {
          throw new Error('Firestore query requires an index. Please check the Firebase console for required indexes.');
        }
      }
      throw new Error('Failed to fetch employees: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updateEmployee(employeeId: string, updates: Partial<Employee>, userId: string): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // Prevent changing organizationId
      const updatesWithoutOrgId = { ...updates };
      delete updatesWithoutOrgId.organizationId;

      const employeeRef = doc(this.db, this.collectionName, employeeId);
      await updateDoc(employeeRef, {
        ...updatesWithoutOrgId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        }
      }
      throw new Error('Failed to update employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deleteEmployee(employeeId: string, userId: string): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const employeeRef = doc(this.db, this.collectionName, employeeId);
      await deleteDoc(employeeRef);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        }
      }
      throw new Error('Failed to delete employee: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getDepartments(userId: string): Promise<string[]> {
    try {
      const employees = await this.getEmployees(userId);
      const departments = [...new Set(employees.map(emp => emp.department))];
      return departments.sort();
    } catch {
      return [];
    }
  }

  async getRoles(userId: string): Promise<string[]> {
    try {
      const employees = await this.getEmployees(userId);
      const roles = [...new Set(employees.map(emp => emp.role))];
      return roles.sort();
    } catch {
      return [];
    }
  }

  private generateAvatarColor(): string {
    const colors = [
      'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-red-200',
      'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-teal-200'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private get db() {
    return db;
  }
}

export const employeeService = new EmployeeService();
