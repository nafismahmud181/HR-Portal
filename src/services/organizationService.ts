import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { firestore } from '../firebase/config';

export interface Organization {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
}

export interface OrganizationUser {
  uid: string;
  role: 'admin' | 'user';
  email: string;
  fullName: string;
  joinedAt: Date;
}

export class OrganizationService {
  /**
   * Create a new organization and set the creator as admin
   */
  static async createOrganization(
    name: string, 
    createdBy: string, 
    userEmail: string, 
    userFullName: string
  ): Promise<string> {
    try {
      console.log('Creating organization:', { name, createdBy, userEmail, userFullName });
      
      // Create organization document
      const orgRef = await addDoc(collection(firestore, 'organizations'), {
        name,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Organization created with ID:', orgRef.id);

      // Create user document in the organization
      const userData = {
        uid: createdBy,
        role: 'admin',
        email: userEmail,
        fullName: userFullName,
        joinedAt: new Date()
      };
      
      console.log('Creating user document with data:', userData);
      
      await setDoc(
        doc(firestore, 'organizations', orgRef.id, 'users', createdBy),
        userData
      );

      console.log('User document created successfully in organization');

      return orgRef.id;
    } catch (error) {
      console.error('Error creating organization:', error);
      console.error('Error details:', {
        name,
        createdBy,
        userEmail,
        userFullName,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to create organization: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get organization by ID
   */
  static async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const orgDoc = await getDoc(doc(firestore, 'organizations', orgId));
      if (orgDoc.exists()) {
        return { id: orgDoc.id, ...orgDoc.data() } as Organization;
      }
      return null;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw new Error('Failed to get organization');
    }
  }

  /**
   * Get user's organization role
   */
  static async getUserRole(orgId: string, uid: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(
        doc(firestore, 'organizations', orgId, 'users', uid)
      );
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      throw new Error('Failed to get user role');
    }
  }

  /**
   * Get all users in an organization
   */
  static async getOrganizationUsers(_orgId: string): Promise<OrganizationUser[]> {
    try {
      // This would need to be implemented with proper Firestore queries
      // For now, returning empty array as this isn't needed for the initial user journey
      return [];
    } catch (error) {
      console.error('Error getting organization users:', error);
      throw new Error('Failed to get organization users');
    }
  }

  /**
   * Get organization by user ID
   */
  static async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      console.log('Looking for organization for user:', userId);
      
      // First, try to find organization where user is the creator
      const orgsRef = collection(firestore, 'organizations');
      const q = query(orgsRef, where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const orgDoc = querySnapshot.docs[0];
        console.log('Found organization where user is creator:', orgDoc.id);
        return { id: orgDoc.id, ...orgDoc.data() } as Organization;
      }
      
      // If not found as creator, check if user is a member of any organization
      // This is a fallback for cases where the user might be added to an organization later
      console.log('User not found as creator, checking if member of any organization...');
      
      // Get all organizations and check if user exists in their users subcollection
      const allOrgsSnapshot = await getDocs(orgsRef);
      
      for (const orgDoc of allOrgsSnapshot.docs) {
        try {
          const userDoc = await getDoc(
            doc(firestore, 'organizations', orgDoc.id, 'users', userId)
          );
          
          if (userDoc.exists()) {
            console.log('Found organization where user is member:', orgDoc.id);
            return { id: orgDoc.id, ...orgDoc.data() } as Organization;
          }
        } catch (error) {
          console.warn('Error checking organization membership:', orgDoc.id, error);
          continue;
        }
      }
      
      console.log('No organization found for user');
      return null;
    } catch (error) {
      console.error('Error getting user organization:', error);
      throw new Error('Failed to get user organization');
    }
  }

  /**
   * Update organization settings
   */
  static async updateOrganization(
    orgId: string, 
    updates: Partial<Pick<Organization, 'industry' | 'companySize' | 'logoUrl'>>
  ): Promise<void> {
    try {
      console.log('Updating organization:', orgId, 'with updates:', updates);
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(firestore, 'organizations', orgId), updateData);
      console.log('Organization updated successfully');
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error(`Failed to update organization: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
