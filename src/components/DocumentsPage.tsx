import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, User, Building, Eye, Trash2 } from 'lucide-react';
import SideNavbar from './SideNavbar';
import { useAuth } from '../contexts/AuthContext';
import { documentService, type DocumentRecord } from '../services/documentService';
import type { TemplateKey } from './templates/TemplateRegistry';

const DocumentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserDocuments();
    }
  }, [currentUser]);

  const loadUserDocuments = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch documents from Firestore
      const userDocuments = await documentService.getUserDocuments(currentUser.uid);
      setDocuments(userDocuments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents. Please try again.';
      setError(errorMessage);
      
      // Log the error for debugging
      if (errorMessage.includes('Firestore is not properly configured')) {
        console.error('Firebase configuration issue. Please check your .env.local file and FIREBASE_SETUP.md');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docRecord: DocumentRecord) => {
    if (docRecord.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = docRecord.downloadUrl;
      link.download = docRecord.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For documents without PDF files, show a message
      alert('This document does not have a downloadable PDF file.');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setShowModal(false);
      setSelectedDocument(null);
    } catch {
      alert('Failed to delete document. Please try again.');
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function' 
        ? timestamp.toDate() 
        : new Date(timestamp as string | number);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTemplateDisplayName = (templateType: TemplateKey) => {
    const templateNames = {
      loe: 'Letter of Employment',
      experience: 'Experience Certificate',
      salary: 'Salary Certificate'
    };
    return templateNames[templateType] || templateType;
  };

  const getFileSizeDisplay = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your documents</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Side Navbar */}
      <SideNavbar currentPage="documents" />

      {/* Main Content */}
      <div className="ml-20">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">My Documents</span>
              </div>
              <div className="text-sm text-gray-600">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Documents</h1>
              <p className="text-gray-600">View and manage all your generated employment documents</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your documents...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={loadUserDocuments}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Documents List */}
            {!loading && !error && (
              <>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600 mb-4">Generate your first employment document to see it here.</p>
                    <a
                      href="/portal"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Create Document
                    </a>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {getTemplateDisplayName(document.documentType)}
                                </span>
                                {document.downloadUrl && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    PDF Available
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {document.fileName}
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{document.employeeName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Building className="w-4 h-4" />
                                  <span>{document.companyName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(document.generatedAt)}</span>
                                </div>
                              </div>

                              {document.fileSize && (
                                <div className="mt-2 text-sm text-gray-500">
                                  File size: {getFileSizeDisplay(document.fileSize)}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedDocument(document);
                                  setShowModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              
                              {document.downloadUrl && (
                                <button
                                  onClick={() => handleDownload(document)}
                                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Download PDF"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDelete(document.id!)}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                title="Delete Document"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Details Modal */}
      {showModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {getTemplateDisplayName(selectedDocument.documentType)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">File Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.fileName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.employeeName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDocument.companyName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Generated On</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedDocument.generatedAt)}
                  </p>
                </div>

                {selectedDocument.fileSize && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Size</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getFileSizeDisplay(selectedDocument.fileSize)}
                    </p>
                  </div>
                )}

                {selectedDocument.downloadUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Download URL</label>
                    <p className="mt-1 text-sm text-gray-900 break-all">
                      {selectedDocument.downloadUrl}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Form Data</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm text-gray-900">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedDocument.formData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {selectedDocument.downloadUrl && (
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download PDF
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
