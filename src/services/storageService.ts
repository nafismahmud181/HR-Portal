import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  type StorageReference 
} from 'firebase/storage';
import { storage } from '../firebase/config';

export class StorageService {
  /**
   * Upload a file to Firebase Storage
   */
  static async uploadFile(path: string, file: File): Promise<string> {
    try {
      console.log('Uploading file to path:', path);
      
      // Create a reference to the file location
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      console.log('File uploaded successfully:', snapshot.metadata.name);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL generated:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(downloadURL: string): Promise<void> {
    try {
      console.log('Deleting file from URL:', downloadURL);
      
      // Extract the path from the download URL
      const url = new URL(downloadURL);
      const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '');
      
      if (!path) {
        throw new Error('Invalid download URL format');
      }
      
      // Create a reference to the file
      const storageRef = ref(storage, path);
      
      // Delete the file
      await deleteObject(storageRef);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a reference to a file in storage
   */
  static getFileRef(path: string): StorageReference {
    return ref(storage, path);
  }

  /**
   * Generate a unique file path for organization logos
   */
  static generateLogoPath(organizationId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `organizations/${organizationId}/logos/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Validate file type for images
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Validate file size (default: 5MB)
   */
  static isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}
