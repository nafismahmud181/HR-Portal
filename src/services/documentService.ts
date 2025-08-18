import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  type Firestore,
  type Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from 'firebase/storage';
import { firestore, storage } from '../firebase/config';
import type { TemplateKey } from '../components/templates/TemplateRegistry';

export interface DocumentRecord {
  id?: string; // Document ID from Firestore
  userId: string;
  documentType: TemplateKey;
  fileName: string;
  employeeName: string;
  companyName: string;
  generatedAt: Timestamp; // serverTimestamp
  formData: Record<string, string | undefined>;
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
  }



  async uploadDocument(documentData: Omit<DocumentRecord, 'generatedAt'>): Promise<string> {
    try {
      // Check if Firestore is properly configured
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      const docRef = await addDoc(collection(this.db, 'documents'), {
        ...documentData,
        generatedAt: serverTimestamp()
      });
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
    formData: Record<string, string | undefined>
  ): Promise<string> {
    const documentRecord: Omit<DocumentRecord, 'generatedAt'> = {
      userId,
      documentType,
      fileName,
      employeeName: (formData.employeeName as string) || 'Unknown',
      companyName: (formData.companyName as string) || 'Unknown',
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
      // Create a unique storage path
      const timestamp = Date.now();
      const storagePath = `documents/${userId}/${timestamp}_${fileName}`;
      
      // Create storage reference
      const storageRef = ref(this.storage, storagePath);
      
      // Upload the file
      await uploadBytes(storageRef, pdfBlob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
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
    formData: Record<string, string | undefined>,
    pdfBlob: Blob
  ): Promise<string> {
    try {
      // First, upload the PDF to Firebase Storage
      const storageInfo = await this.uploadPDFFile(pdfBlob, fileName, userId);
      
      // Then, save the document record with storage information
      const documentRecord: Omit<DocumentRecord, 'generatedAt'> = {
        userId,
        documentType,
        fileName,
        employeeName: (formData.employeeName as string) || 'Unknown',
        companyName: (formData.companyName as string) || 'Unknown',
        formData,
        storagePath: storageInfo.storagePath,
        fileSize: storageInfo.fileSize,
        downloadUrl: storageInfo.downloadUrl
      };

      const docId = await this.uploadDocument(documentRecord);
      return docId;
    } catch (error) {
      console.error('Error saving document with PDF:', error);
      throw error;
    }
  }

  // Get all documents for a specific user
  async getUserDocuments(userId: string): Promise<DocumentRecord[]> {
    try {
      // Check if Firestore is properly configured
      if (!this.db || Object.keys(this.db).length === 0) {
        throw new Error('Firestore is not properly configured');
      }

      // Query without orderBy to avoid index requirement
      const q = query(
        collection(this.db, 'documents'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: DocumentRecord[] = [];
      
      querySnapshot.forEach((docSnapshot) => {
        documents.push({
          id: docSnapshot.id,
          ...docSnapshot.data()
        } as DocumentRecord);
      });
      
      // Sort documents in memory instead of in the query
      documents.sort((a, b) => {
        if (!a.generatedAt || !b.generatedAt) return 0;
        return b.generatedAt.toMillis() - a.generatedAt.toMillis();
      });
      
      return documents;
    } catch (error) {
      // Provide more specific error information
      if (error instanceof Error) {
        if (error.message.includes('Firestore is not properly configured')) {
          throw new Error('Firestore is not properly configured. Please check your Firebase configuration.');
        } else if (error.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        } else if (error.message.includes('unavailable')) {
          throw new Error('Firestore service is currently unavailable. Please try again later.');
        } else if (error.message.includes('indexes')) {
          throw new Error('Firestore query requires an index. Please check the Firebase console for required indexes.');
        }
      }
      
      throw new Error('Failed to fetch user documents: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Delete a document and its associated PDF file
  async deleteDocument(documentId: string): Promise<void> {
    try {
      // First, get the document to find the storage path
      const docRef = doc(this.db, 'documents', documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }
      
      const documentData = docSnap.data() as DocumentRecord;
      
      // Delete from Firestore
      await deleteDoc(docRef);
      
      // If there's a PDF file in storage, delete it too
      if (documentData.storagePath) {
        try {
          const storageRef = ref(this.storage, documentData.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          // Log storage deletion error but don't fail the operation
          console.error('Error deleting PDF from storage:', storageError);
        }
      }
    } catch {
      throw new Error('Failed to delete document');
    }
  }
}

export const documentService = new DocumentService();
