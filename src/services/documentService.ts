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

export interface UploadRecord {
  id?: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  uploadedAt: Timestamp; // serverTimestamp
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

  // ========= Generic uploads (for Recent section in picker) =========

  async uploadUserAsset(userId: string, file: File): Promise<UploadRecord> {
    if (!this.db || Object.keys(this.db).length === 0) {
      throw new Error('Firestore is not properly configured');
    }

    const timestamp = Date.now();
    const storagePath = `uploads/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    const uploadDoc = await addDoc(collection(this.db, 'uploads'), {
      userId,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      storagePath,
      downloadUrl,
      uploadedAt: serverTimestamp(),
    });

    // Compose record; uploadedAt will be server time on the server; can be undefined in client read until fetched again
    const placeholder = serverTimestamp() as unknown as Timestamp;
    return {
      id: uploadDoc.id,
      userId,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      storagePath,
      downloadUrl,
      uploadedAt: placeholder,
    } as unknown as UploadRecord;
  }

  async getUserUploads(userId: string): Promise<UploadRecord[]> {
    if (!this.db || Object.keys(this.db).length === 0) {
      throw new Error('Firestore is not properly configured');
    }
    const q = query(collection(this.db, 'uploads'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const uploads: UploadRecord[] = [];
    snap.forEach((docSnap) => {
      uploads.push({ id: docSnap.id, ...(docSnap.data() as Omit<UploadRecord, 'id'>) });
    });
    uploads.sort((a, b) => {
      if (!a.uploadedAt || !b.uploadedAt) return 0;
      return b.uploadedAt.toMillis() - a.uploadedAt.toMillis();
    });
    return uploads;
  }

  // Delete an uploaded file from both Firestore and Storage
  async deleteUserUpload(uploadId: string): Promise<void> {
    try {
      // First, get the upload record to find the storage path
      const uploadRef = doc(this.db, 'uploads', uploadId);
      const uploadSnap = await getDoc(uploadRef);
      
      if (!uploadSnap.exists()) {
        throw new Error('Upload record not found');
      }
      
      const uploadData = uploadSnap.data() as UploadRecord;
      
      // Delete from Firestore
      await deleteDoc(uploadRef);
      
      // Delete from Storage
      if (uploadData.storagePath) {
        try {
          const storageRef = ref(this.storage, uploadData.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          // Log storage deletion error but don't fail the operation
          console.error('Error deleting file from storage:', storageError);
        }
      }
    } catch (error) {
      throw new Error('Failed to delete upload: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export const documentService = new DocumentService();
