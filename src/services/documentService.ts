import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  type Firestore 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { firestore, storage } from '../firebase/config';
import type { TemplateKey } from '../components/templates/TemplateRegistry';

export interface DocumentRecord {
  userId: string;
  documentType: TemplateKey;
  fileName: string;
  employeeName: string;
  companyName: string;
  generatedAt: any; // serverTimestamp
  formData: Record<string, any>;
  pdfBlob?: Blob;
  pdfUrl?: string;
  storagePath?: string; // Firebase Storage path
  fileSize?: number; // File size in bytes
  downloadUrl?: string; // Public download URL
}

export class DocumentService {
  private db: Firestore;
  private storage: FirebaseStorage;

  constructor() {
    this.db = firestore;
    this.storage = storage;
    console.log('DocumentService initialized with Firestore:', this.db);
    console.log('DocumentService initialized with Storage:', this.storage);
  }

  // Test method to check if Firestore is working
  async testConnection(): Promise<boolean> {
    try {
      if (!this.db || Object.keys(this.db).length === 0) {
        console.error('Firestore is not properly configured');
        return false;
      }
      
      console.log('Firestore connection test passed');
      return true;
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      return false;
    }
  }

  async uploadDocument(documentData: Omit<DocumentRecord, 'generatedAt'>): Promise<string> {
    try {
      // Check if Firestore is properly configured
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      console.log('Attempting to upload document to Firestore...');
      const docRef = await addDoc(collection(this.db, 'documents'), {
        ...documentData,
        generatedAt: serverTimestamp()
      });
      
      console.log('Document uploaded successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error uploading document to Firestore:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Firestore service is currently unavailable. Please try again later.');
        }
      }
      
      throw new Error('Failed to upload document to database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async saveDocumentRecord(
    userId: string,
    documentType: TemplateKey,
    fileName: string,
    formData: Record<string, any>
  ): Promise<string> {
    const documentRecord: Omit<DocumentRecord, 'generatedAt'> = {
      userId,
      documentType,
      fileName,
      employeeName: formData.employeeName || 'Unknown',
      companyName: formData.companyName || 'Unknown',
      formData
    };

    return await this.uploadDocument(documentRecord);
  }

  // Upload PDF file to Firebase Storage
  async uploadPDFFile(pdfBlob: Blob, fileName: string, userId: string): Promise<{
    storagePath: string;
    downloadUrl: string;
    fileSize: number;
  }> {
    try {
      console.log('Starting PDF upload to Firebase Storage...');
      console.log('File size:', pdfBlob.size, 'bytes');
      
      // Create a unique storage path
      const timestamp = Date.now();
      const storagePath = `documents/${userId}/${timestamp}_${fileName}`;
      
      // Create storage reference
      const storageRef = ref(this.storage, storagePath);
      
      // Upload the file
      console.log('Uploading to storage path:', storagePath);
      await uploadBytes(storageRef, pdfBlob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      console.log('PDF uploaded successfully to Storage');
      console.log('Storage path:', storagePath);
      console.log('Download URL:', downloadUrl);
      
      return {
        storagePath,
        downloadUrl,
        fileSize: pdfBlob.size
      };
    } catch (error) {
      console.error('Error uploading PDF to Storage:', error);
      throw new Error('Failed to upload PDF file to storage');
    }
  }

  // Enhanced method to save document with PDF file
  async saveDocumentWithPDF(
    userId: string,
    documentType: TemplateKey,
    fileName: string,
    formData: Record<string, any>,
    pdfBlob: Blob
  ): Promise<string> {
    try {
      console.log('Saving document with PDF file...');
      
      // First, upload the PDF to Firebase Storage
      const storageInfo = await this.uploadPDFFile(pdfBlob, fileName, userId);
      
      // Then, save the document record with storage information
      const documentRecord: Omit<DocumentRecord, 'generatedAt'> = {
        userId,
        documentType,
        fileName,
        employeeName: formData.employeeName || 'Unknown',
        companyName: formData.companyName || 'Unknown',
        formData,
        storagePath: storageInfo.storagePath,
        fileSize: storageInfo.fileSize,
        downloadUrl: storageInfo.downloadUrl
      };

      const docId = await this.uploadDocument(documentRecord);
      
      console.log('Document and PDF saved successfully. Document ID:', docId);
      return docId;
    } catch (error) {
      console.error('Error saving document with PDF:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();
