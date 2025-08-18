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

export interface Employee {
  id?: string;
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

  async addEmployee(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      const now = Timestamp.now();
      const employeeWithTimestamps = {
        ...employeeData,
        createdAt: now,
        updatedAt: now,
        avatarColor: this.generateAvatarColor()
      };

      const docRef = await addDoc(collection(this.db, this.collectionName), employeeWithTimestamps);
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

  async getEmployees(filters: EmployeeFilters = { searchTerm: '', department: '', role: '', status: '' }): Promise<Employee[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      let q = query(collection(this.db, this.collectionName), orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.department && filters.department !== 'All Departments') {
        q = query(q, where('department', '==', filters.department));
      }
      if (filters.role && filters.role !== 'All Roles') {
        q = query(q, where('role', '==', filters.role));
      }
      if (filters.status && filters.status !== 'All Statuses') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      const employees: Employee[] = [];

      querySnapshot.forEach((doc) => {
        employees.push({
          id: doc.id,
          ...doc.data()
        } as Employee);
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

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      const employeeRef = doc(this.db, this.collectionName, employeeId);
      await updateDoc(employeeRef, {
        ...updates,
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

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
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

  async getDepartments(): Promise<string[]> {
    try {
      const employees = await this.getEmployees();
      const departments = [...new Set(employees.map(emp => emp.department))];
      return departments.sort();
    } catch {
      return [];
    }
  }

  async getRoles(): Promise<string[]> {
    try {
      const employees = await this.getEmployees();
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
