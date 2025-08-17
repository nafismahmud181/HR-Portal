# Firestore Integration for PDF Document Storage

## Overview
The HR Portal now automatically saves all generated PDF documents to Firestore under the user's account. This provides a complete audit trail and allows users to access their previously generated documents.

## Features

### Automatic Document Storage
- **PDF with Background**: When users generate PDFs with custom backgrounds, the document record is automatically saved to Firestore
- **Simple PDF**: When users generate simple PDFs, the document record is also saved to Firestore
- **User Association**: All documents are linked to the authenticated user's account

### Document Records Stored
Each document record in Firestore contains:
- `userId`: The authenticated user's UID
- `documentType`: Type of document (loe, experience, salary)
- `fileName`: Generated filename
- `employeeName`: Employee name from the form
- `companyName`: Company name from the form
- `generatedAt`: Server timestamp of generation
- `formData`: Complete form data used to generate the document

## Implementation Details

### Firebase Configuration
- Added Firestore to the Firebase configuration
- Exported `firestore` instance for use throughout the application

### Document Service
- Created `DocumentService` class in `src/services/documentService.ts`
- Handles all Firestore operations for document storage
- Provides methods for uploading document records

### PDF Generator Updates
- Modified `PDFGenerator` to return PDF blobs along with saving files
- Updated return types to support both file download and blob generation
- Maintains backward compatibility with existing functionality

### Component Integration
- Updated `HRPortal` component to use authentication context
- Integrated document service with PDF generation functions
- Added user authentication checks before document generation

## Usage

### For Users
1. **Login Required**: Users must be authenticated to generate and save documents
2. **Automatic Saving**: Documents are automatically saved when generated
3. **No Additional Steps**: The process is transparent to users

### For Developers
1. **Import Services**: Use `documentService` for Firestore operations
2. **Authentication**: Ensure user is authenticated before calling document services
3. **Error Handling**: Implement proper error handling for Firestore operations

## Database Structure

### Collection: `documents`
```typescript
interface DocumentRecord {
  userId: string;
  documentType: 'loe' | 'experience' | 'salary';
  fileName: string;
  employeeName: string;
  companyName: string;
  generatedAt: Timestamp;
  formData: Record<string, any>;
}
```

## Security Rules
Ensure your Firestore security rules allow authenticated users to read/write their own documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{documentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Future Enhancements
- Document retrieval and management interface
- Document versioning and history
- Bulk document operations
- Document sharing and collaboration features
- Advanced search and filtering capabilities
