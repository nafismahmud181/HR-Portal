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
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { firestore as db } from '../firebase/config';
import { OrganizationService } from './organizationService';

export interface LeaveRequest {
  id?: string;
  organizationId: string; // NEW: Organization isolation
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement' | 'Other';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  managerId?: string;
  managerName?: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LeaveBalance {
  id?: string;
  organizationId: string; // NEW: Organization isolation
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement';
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  updatedAt: Timestamp;
}

export interface LeaveFilters {
  searchTerm: string;
  status: string;
  leaveType: string;
  department: string;
  dateRange: {
    start: string;
    end: string;
  };
}

class LeaveService {
  private leaveCollection = 'leaveRequests';
  private balanceCollection = 'leaveBalances';

  private getDefaultAllowance(leaveType: LeaveRequest['leaveType']): number {
    const defaults: Record<LeaveRequest['leaveType'], number> = {
      Annual: 20,
      Sick: 10,
      Personal: 5,
      Maternity: 90,
      Paternity: 10,
      Bereavement: 5,
      Other: 0,
    };
    return defaults[leaveType] ?? 0;
  }

  private isBalanceTrackedType(leaveType: LeaveRequest['leaveType']): leaveType is LeaveBalance['leaveType'] {
    return (
      leaveType === 'Annual' ||
      leaveType === 'Sick' ||
      leaveType === 'Personal' ||
      leaveType === 'Maternity' ||
      leaveType === 'Paternity' ||
      leaveType === 'Bereavement'
    );
  }

  async createLeaveRequest(leaveData: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const now = Timestamp.now();
      const leaveWithTimestamps = {
        ...leaveData,
        organizationId: userOrg.id, // Ensure correct organization
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(this.db, this.leaveCollection), leaveWithTimestamps);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLeaveRequests(userId: string, filters: LeaveFilters = { 
    searchTerm: '', 
    status: '', 
    leaveType: '', 
    department: '',
    dateRange: { start: '', end: '' }
  }): Promise<LeaveRequest[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization to filter leave requests
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      // CRITICAL: Build the query with ALL where clauses first, then orderBy
      const whereClauses = [
        where('organizationId', '==', userOrg.id),
        ...(filters.status && filters.status !== 'All Statuses' ? [where('status', '==', filters.status)] : []),
        ...(filters.leaveType && filters.leaveType !== 'All Types' ? [where('leaveType', '==', filters.leaveType)] : [])
      ];
      
      // SECURITY: Log the query being executed for debugging
      console.log(`Executing leave request query for organization: ${userOrg.id}`);
      console.log(`Number of where clauses: ${whereClauses.length}`);
      console.log(`Filters applied:`, { status: filters.status, leaveType: filters.leaveType });
      
      // Create the query with all where clauses first, then orderBy
      const q = query(
        collection(this.db, this.leaveCollection),
        ...whereClauses,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leaveRequests: LeaveRequest[] = [];

      querySnapshot.forEach((doc) => {
        const leaveData = doc.data() as LeaveRequest;
        // CRITICAL: Double-check organization isolation and log any violations
        if (!leaveData.organizationId) {
          console.warn(`Leave request ${doc.id} missing organizationId - skipping for security`);
          return; // Skip this document
        }
        if (leaveData.organizationId === userOrg.id) {
          leaveRequests.push({
            id: doc.id,
            ...leaveData
          });
        } else {
          console.warn(`SECURITY VIOLATION: Leave request ${doc.id} belongs to organization ${leaveData.organizationId} but user is from ${userOrg.id}`);
        }
      });

      // Apply additional filters on client side
      let filteredRequests = leaveRequests;

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredRequests = filteredRequests.filter(request => 
          request.employeeName.toLowerCase().includes(searchLower) ||
          request.employeeEmail.toLowerCase().includes(searchLower)
        );
      }

      if (filters.dateRange.start && filters.dateRange.end) {
        filteredRequests = filteredRequests.filter(request => {
          const requestStart = new Date(request.startDate);
          const requestEnd = new Date(request.endDate);
          const filterStart = new Date(filters.dateRange.start);
          const filterEnd = new Date(filters.dateRange.end);
          
          return requestStart >= filterStart && requestEnd <= filterEnd;
        });
      }

      return filteredRequests;
    } catch (error) {
      throw new Error('Failed to fetch leave requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLeaveRequestById(requestId: string): Promise<LeaveRequest | null> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      const docRef = doc(this.db, this.leaveCollection, requestId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as LeaveRequest;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to fetch leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updateLeaveRequest(requestId: string, updates: Partial<LeaveRequest>): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      const requestRef = doc(this.db, this.leaveCollection, requestId);
      await updateDoc(requestRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error('Failed to update leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async deleteLeaveRequest(requestId: string, userId: string): Promise<void> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Fetch the request first so we can reconcile balances if needed
      const existingRequest = await this.getLeaveRequestById(requestId);

      const requestRef = doc(this.db, this.leaveCollection, requestId);
      await deleteDoc(requestRef);

      // If the request was approved and tracked, decrement usedDays
      if (
        existingRequest &&
        existingRequest.status === 'Approved' &&
        this.isBalanceTrackedType(existingRequest.leaveType)
      ) {
        const year = new Date(existingRequest.startDate).getFullYear();
        const balances = await this.getLeaveBalances(existingRequest.employeeId, year, userId);
        const existingBalance = balances.find(b => b.leaveType === existingRequest.leaveType);

        const totalDaysAllowance = existingBalance?.totalDays ?? this.getDefaultAllowance(existingRequest.leaveType);
        const priorUsedDays = existingBalance?.usedDays ?? 0;
        const usedDays = Math.max(priorUsedDays - (existingRequest.totalDays || 0), 0);
        const remainingDays = Math.max(totalDaysAllowance - usedDays, 0);

        // We need to get the userId from the organization context
        // For now, we'll use a placeholder - this should be refactored to pass userId
        await this.updateLeaveBalance({
          employeeId: existingRequest.employeeId,
          employeeName: existingRequest.employeeName,
          leaveType: existingRequest.leaveType,
          totalDays: totalDaysAllowance,
          usedDays,
          remainingDays,
          year,
          organizationId: existingRequest.organizationId,
        }, userId);
      }
    } catch (error) {
      throw new Error('Failed to delete leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async approveLeaveRequest(requestId: string, managerId: string, managerName?: string): Promise<void> {
    try {
      const request = await this.getLeaveRequestById(requestId);
      if (!request) {
        throw new Error('Leave request not found');
      }

      await this.updateLeaveRequest(requestId, {
        status: 'Approved',
        approvedBy: managerName ?? managerId,
        approvedAt: Timestamp.now()
      });

      // Update per-employee balance for tracked types only
      if (this.isBalanceTrackedType(request.leaveType)) {
        const year = new Date(request.startDate).getFullYear();

        const existingBalances = await this.getLeaveBalances(request.employeeId, year, managerId);
        const existing = existingBalances.find(b => b.leaveType === request.leaveType);

        const totalDaysAllowance = existing?.totalDays ?? this.getDefaultAllowance(request.leaveType);
        const usedDays = (existing?.usedDays ?? 0) + (request.totalDays || 0);
        const remainingDays = Math.max(totalDaysAllowance - usedDays, 0);

        // We need to get the userId from the organization context
        // For now, we'll use a placeholder - this should be refactored to pass userId
        await this.updateLeaveBalance({
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          leaveType: request.leaveType,
          totalDays: totalDaysAllowance,
          usedDays,
          remainingDays,
          year,
          organizationId: request.organizationId,
        }, managerId);
      }
    } catch (error) {
      throw new Error('Failed to approve leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async rejectLeaveRequest(requestId: string, managerId: string, rejectionReason: string, managerName?: string): Promise<void> {
    try {
      await this.updateLeaveRequest(requestId, {
        status: 'Rejected',
        approvedBy: managerName ?? managerId,
        approvedAt: Timestamp.now(),
        rejectionReason
      });
    } catch (error) {
      throw new Error('Failed to reject leave request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLeaveRequestsByEmployee(employeeId: string, userId: string): Promise<LeaveRequest[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization to ensure data isolation
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const q = query(
        collection(this.db, this.leaveCollection),
        where('organizationId', '==', userOrg.id),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leaveRequests: LeaveRequest[] = [];

      querySnapshot.forEach((doc) => {
        leaveRequests.push({
          id: doc.id,
          ...doc.data()
        } as LeaveRequest);
      });

      return leaveRequests;
    } catch (error) {
      throw new Error('Failed to fetch employee leave requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLeaveRequestsByManager(managerId: string, userId: string): Promise<LeaveRequest[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization to ensure data isolation
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const q = query(
        collection(this.db, this.leaveCollection),
        where('organizationId', '==', userOrg.id),
        where('managerId', '==', managerId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const leaveRequests: LeaveRequest[] = [];

      querySnapshot.forEach((doc) => {
        leaveRequests.push({
          id: doc.id,
          ...doc.data()
        } as LeaveRequest);
      });

      return leaveRequests;
    } catch (error) {
      throw new Error('Failed to fetch manager leave requests: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getLeaveBalances(employeeId: string, year: number = new Date().getFullYear(), userId?: string): Promise<LeaveBalance[]> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Build query with organization filter if userId is provided
      let userOrg: { id: string } | null = null;
      
      // Add organization filter if userId is provided
      if (userId) {
        try {
          userOrg = await OrganizationService.getUserOrganization(userId);
        } catch (error) {
          console.warn('Could not get user organization for leave balance query:', error);
        }
      }

      const whereClauses = [
        ...(userOrg ? [where('organizationId', '==', userOrg.id)] : []),
        where('employeeId', '==', employeeId),
        where('year', '==', year)
      ];

      const q = query(
        collection(this.db, this.balanceCollection),
        ...whereClauses
      );

      const querySnapshot = await getDocs(q);
      const balances: LeaveBalance[] = [];

      querySnapshot.forEach((doc) => {
        const balanceData = doc.data() as LeaveBalance;
        // Double-check organization isolation if userId was provided
        if (!userId || balanceData.organizationId === (userOrg?.id || '')) {
          balances.push({
            id: doc.id,
            ...balanceData
          });
        }
      });

      return balances;
    } catch (error) {
      throw new Error('Failed to fetch leave balances: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async updateLeaveBalance(balanceData: Omit<LeaveBalance, 'id' | 'updatedAt'>, userId: string): Promise<string> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Get user's organization
      const userOrg = await OrganizationService.getUserOrganization(userId);
      if (!userOrg) {
        throw new Error('User does not belong to any organization');
      }

      const now = Timestamp.now();
      const balanceWithTimestamp = {
        ...balanceData,
        organizationId: userOrg.id, // Ensure correct organization
        updatedAt: now
      };

      // Check if balance already exists
      const existingBalances = await this.getLeaveBalances(balanceData.employeeId, balanceData.year, userId);
      const existingBalance = existingBalances.find(b => b.leaveType === balanceData.leaveType);

      if (existingBalance) {
        // Update existing balance
        await updateDoc(doc(this.db, this.balanceCollection, existingBalance.id!), {
          ...balanceWithTimestamp
        });
        return existingBalance.id!;
      } else {
        // Create new balance
        const docRef = await addDoc(collection(this.db, this.balanceCollection), balanceWithTimestamp);
        return docRef.id;
      }
    } catch (error) {
      throw new Error('Failed to update leave balance: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  calculateLeaveDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  }

  private get db() {
    return db;
  }
}

export const leaveService = new LeaveService();
