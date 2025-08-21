import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { firestore } from '../firebase/config';
import { OrganizationService } from './organizationService';

export interface Department {
  id?: string;
  organizationId: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
  color?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  color?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  color?: string;
  isActive?: boolean;
}

class DepartmentService {
  private collectionName = 'departments';

  /**
   * Create a new department
   */
  async createDepartment(departmentData: CreateDepartmentData, userId: string): Promise<string> {
    try {
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const now = Timestamp.now();
      const departmentWithMetadata = {
        ...departmentData,
        organizationId: userOrg.id,
        employeeCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(firestore, this.collectionName), departmentWithMetadata);
      return docRef.id;
    } catch (error) {
      throw new Error(`Failed to create department: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all departments for an organization
   */
  async getDepartments(userId: string): Promise<Department[]> {
    try {
      console.log('Getting departments for user:', userId);
      
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }
      
      console.log('User organization:', userOrg.id);

      const q = query(
        collection(firestore, this.collectionName),
        where('organizationId', '==', userOrg.id)
        // Temporarily removed orderBy to work without index
        // orderBy('name', 'asc')
      );

      console.log('Executing department query for organization:', userOrg.id);
      const querySnapshot = await getDocs(q);
      console.log('Query successful, found', querySnapshot.size, 'departments');
      
      const departments: Department[] = [];

      querySnapshot.forEach((doc) => {
        const departmentData = doc.data() as Department;
        // Double-check organization isolation
        if (departmentData.organizationId === userOrg.id) {
          departments.push({
            id: doc.id,
            ...departmentData
          });
        }
      });

      // Client-side sorting to maintain functionality while index builds
      departments.sort((a, b) => a.name.localeCompare(b.name));

      console.log('Returning', departments.length, 'departments');
      return departments;
    } catch (error) {
      console.error('Error in getDepartments:', error);
      throw new Error(`Failed to fetch departments: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a department by ID
   */
  async getDepartmentById(departmentId: string, userId: string): Promise<Department | null> {
    try {
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const docSnap = await getDocs(query(
        collection(firestore, this.collectionName),
        where('__name__', '==', departmentId),
        where('organizationId', '==', userOrg.id)
      ));

      if (!docSnap.empty) {
        const doc = docSnap.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Department;
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to fetch department: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update a department
   */
  async updateDepartment(departmentId: string, updates: UpdateDepartmentData, userId: string): Promise<void> {
    try {
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // Verify the department belongs to the user's organization
      const existingDepartment = await this.getDepartmentById(departmentId, userId);
      if (!existingDepartment) {
        throw new Error('Department not found or access denied');
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(firestore, this.collectionName, departmentId), updateData);
    } catch (error) {
      throw new Error(`Failed to update department: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a department
   */
  async deleteDepartment(departmentId: string, userId: string): Promise<void> {
    try {
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // Verify the department belongs to the user's organization
      const existingDepartment = await this.getDepartmentById(departmentId, userId);
      if (!existingDepartment) {
        throw new Error('Department not found or access denied');
      }

      // Check if department has employees
      if (existingDepartment.employeeCount > 0) {
        throw new Error('Cannot delete department with active employees. Please reassign employees first.');
      }

      await deleteDoc(doc(firestore, this.collectionName, departmentId));
    } catch (error) {
      throw new Error(`Failed to delete department: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get department statistics
   */
  async getDepartmentStats(userId: string): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    totalEmployees: number;
  }> {
    try {
      const departments = await this.getDepartments(userId);
      
      const totalDepartments = departments.length;
      const activeDepartments = departments.filter(dept => dept.isActive).length;
      const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);

      return {
        totalDepartments,
        activeDepartments,
        totalEmployees
      };
    } catch (error) {
      throw new Error(`Failed to fetch department statistics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if department name already exists in organization
   */
  async isDepartmentNameExists(name: string, userId: string, excludeId?: string): Promise<boolean> {
    try {
      console.log('Checking if department name exists:', name, 'for user:', userId);
      
      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }
      
      console.log('User organization for name check:', userOrg.id);

      // Use a direct query to check for duplicate names instead of fetching all departments
      const q = query(
        collection(firestore, this.collectionName),
        where('organizationId', '==', userOrg.id),
        where('name', '==', name)
      );

      console.log('Executing name check query for organization:', userOrg.id);
      const querySnapshot = await getDocs(q);
      console.log('Name check query successful, found', querySnapshot.size, 'matching departments');
      
      // Check if any department with this name exists (excluding the current one if editing)
      for (const doc of querySnapshot.docs) {
        if (doc.id !== excludeId) {
          console.log('Found duplicate department name:', name, 'in document:', doc.id);
          return true; // Name already exists
        }
      }
      
      console.log('Department name is available:', name);
      return false; // Name is available
    } catch (error) {
      console.error('Error checking department name:', error);
      // Don't throw error here, just return false to allow the operation to proceed
      // This prevents the duplicate check from blocking department creation
      return false;
    }
  }
}

export const departmentService = new DepartmentService();
