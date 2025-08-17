import React, { useState, useEffect } from 'react';
import { FileText, Download, User, Calendar, DollarSign, PenTool, Building } from 'lucide-react';
import { generatePDF } from './PDFGenerator';
import SideNavbar from './SideNavbar';
import type { TemplateKey } from './templates/TemplateRegistry';
import { templates } from './templates/TemplateRegistry';
import { documentService } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';


// Define types for better type safety
type QualityLevel = 'standard' | 'high' | 'ultra';

interface FormData {
  employeeName: string;
  joiningDate: string;
  salary: string;
  currency: string;
  position: string;
  companyName: string;
  signatoryName: string;
  signatoryTitle: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  signatureImage?: string; // Optional signature image data URL
  [key: string]: string | undefined; // Index signature for flexibility
}

interface InputField {
  label: string;
  icon: React.ReactElement;
  type: string;
  options?: string[];
}

const HRPortal = () => {
  const { currentUser } = useAuth();
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('loe');
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>('high');
  const [formData, setFormData] = useState<FormData>({
    employeeName: '',
    joiningDate: '',
    salary: '',
    currency: 'USD',
    position: 'Data Scientist',
    companyName: 'Inteliweave',
    signatoryName: 'Rageeb Noor Uddin',
    signatoryTitle: 'Proprietor',
    contactPhone: '+880 1789 490 105',
    contactEmail: 'info@inteliweave.com.bd',
    website: 'www.inteliweave.com.bd'
  });

  // Read document type from URL parameters and pre-select template
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const documentType = urlParams.get('type');
    
    if (documentType && ['loe', 'experience', 'salary'].includes(documentType)) {
      setActiveTemplate(documentType as TemplateKey);
    }


  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/');
  };



  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store the file path or handle the upload
      setSelectedBackgroundImage(URL.createObjectURL(file));
    }
  };

  const handleSignatureImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert to data URL for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target as FileReader;
        if (target.result) {
          setFormData(prev => ({ ...prev, signatureImage: target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPDFWithBackground = async (): Promise<void> => {
    if (!selectedBackgroundImage) {
      return;
    }

    if (!currentUser || !currentUser.uid) {
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePDF(selectedBackgroundImage, formData, activeTemplate, qualityLevel);
      const { blob, filename } = result;
      
      // Upload PDF file to Firebase Storage and save document record to Firestore
      await documentService.saveDocumentWithPDF(
        currentUser.uid,
        activeTemplate,
        filename,
        formData,
        blob
      );
      
      // Show success message to user

    } catch (error) {
      // Check if it's a Firestore error specifically
      if (error instanceof Error && error.message.includes('Failed to upload document to database')) {
        // PDF generated successfully, but failed to save to database
      } else {
        // Error generating PDF
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = async (): Promise<void> => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      return;
    }
    
    // Simple text content generation for basic PDF
    let content = '';
    switch(activeTemplate) {
      case 'loe':
        content = `To Whom It May Concern:

Dear Sir/Madam,

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is an employee at ${formData.companyName}, and ${formData.employeeName ? 'he/she' : 'they'} has been working as a ${formData.position} since ${formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}. ${formData.employeeName ? 'His/Her' : 'Their'} current salary is ${formData.currency} ${formData.salary || '[Salary Amount]'}, paid bi-weekly.

If you have any questions regarding ${formData.employeeName ? `${formData.employeeName}'s` : 'the employee\'s'} employment, please contact our office at ${formData.contactPhone} or ${formData.contactEmail}.

${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.contactEmail}
${formData.website}`;
        break;
      case 'experience':
        content = `TO WHOM IT MAY CONCERN

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} has been working with ${formData.companyName} as ${formData.position} since ${formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}.

During ${formData.employeeName ? 'his/her' : 'their'} tenure, ${formData.employeeName ? 'he/she' : 'they'} has shown dedication, professionalism, and excellent work performance.

We wish ${formData.employeeName ? 'him/her' : 'them'} all the best for future endeavors.

${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.companyName}`;
        break;
      case 'salary':
        content = `SALARY CERTIFICATE

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is currently employed with ${formData.companyName} as ${formData.position}.

${formData.employeeName ? 'His/Her' : 'Their'} current monthly salary is ${formData.currency} ${formData.salary || '[Salary Amount]'}.

This certificate is being issued upon ${formData.employeeName ? 'his/her' : 'their'} request.

${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.companyName}
${formData.contactEmail}`;
        break;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templates[activeTemplate].name}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              margin: 40px;
              color: #000;
            }
            .letter-content {
              white-space: pre-wrap;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .signature-section {
              margin-top: 50px;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${formData.companyName}</div>
          </div>
          <div class="letter-content">${content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = async () => {
      setTimeout(async () => {
        if (printWindow) {
          printWindow.print();
          printWindow.close();
          
          // Generate filename for the simple PDF
          let filename: string;
          switch(activeTemplate) {
            case 'loe':
              filename = `Simple_Letter_of_Employment_${formData.employeeName || 'Employee'}.pdf`;
              break;
            case 'experience':
              filename = `Simple_Experience_Certificate_${formData.employeeName || 'Employee'}.pdf`;
              break;
            case 'salary':
              filename = `Simple_Salary_Certificate_${formData.employeeName || 'Employee'}.pdf`;
              break;
            default:
              filename = `Simple_Document_${formData.employeeName || 'Employee'}.pdf`;
          }
          
                     // For simple PDFs, we don't have a blob, so we just save the metadata
           // The user can regenerate the PDF later using the stored form data
                       try {
              await documentService.saveDocumentRecord(
                currentUser.uid,
                activeTemplate,
                filename,
                formData
              );
            } catch {
              // Don't show error to user since PDF was generated successfully
            }
        }
      }, 500);
    };
  };

  const inputFields: Record<keyof FormData, InputField> = {
    employeeName: { label: 'Employee Name', icon: <User className="w-4 h-4" />, type: 'text' },
    joiningDate: { label: 'Joining Date', icon: <Calendar className="w-4 h-4" />, type: 'date' },
    salary: { label: 'Salary Amount', icon: <DollarSign className="w-4 h-4" />, type: 'number' },
    currency: { label: 'Currency', icon: <DollarSign className="w-4 h-4" />, type: 'select', options: ['USD', 'BDT', 'EUR', 'GBP'] },
    position: { label: 'Position/Designation', icon: <Building className="w-4 h-4" />, type: 'text' },
    signatoryName: { label: 'Signatory Name', icon: <PenTool className="w-4 h-4" />, type: 'text' },
    companyName: { label: 'Company Name', icon: <Building className="w-4 h-4" />, type: 'text' },
    signatoryTitle: { label: 'Signatory Title', icon: <PenTool className="w-4 h-4" />, type: 'text' },
    contactPhone: { label: 'Contact Phone', icon: <User className="w-4 h-4" />, type: 'text' },
    contactEmail: { label: 'Contact Email', icon: <User className="w-4 h-4" />, type: 'email' },
    website: { label: 'Website', icon: <Building className="w-4 h-4" />, type: 'text' },
    signatureImage: { label: 'Signature Image', icon: <PenTool className="w-4 h-4" />, type: 'file' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Side Navbar */}
      <SideNavbar 
        currentPage="portal" 
      />

      {/* Main Content with Fixed Left Margin for Sidebar */}
      <div className="ml-20">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900">Document Generator</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Document Generator</h1>
              <p className="text-gray-600">Create professional employment letters with custom backgrounds</p>
              
              {/* Current Template Indicator */}
              <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="font-medium">
                  {templates[activeTemplate].name}
                </span>
              </div>
            </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields - Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Background Image Upload Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Background Image</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Background Image
                      </label>
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleBackgroundImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        PNG, JPG, JPEG formats (A4 format recommended)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PDF Quality</label>
                      <select
                        value={qualityLevel}
                        onChange={(e) => setQualityLevel(e.target.value as QualityLevel)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="standard">Standard (Fast)</option>
                        <option value="high">High Quality</option>
                        <option value="ultra">Ultra HD</option>
                      </select>
                      <p className="text-xs text-gray-600 mt-1">
                        {qualityLevel === 'standard' ? 'Standard (2x)' : 
                         qualityLevel === 'high' ? 'High (4x)' : 'Ultra HD (6x)'} - Higher quality = larger file size
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Letter Details</h3>
                  <div className="space-y-4">
                    {templates[activeTemplate].fields.map(field => {
                      const fieldConfig = inputFields[field as keyof FormData];
                      return (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center space-x-2">
                              {fieldConfig.icon}
                              <span>{fieldConfig.label}</span>
                            </div>
                          </label>
                          {fieldConfig.type === 'select' ? (
                            <select
                              value={formData[field as keyof FormData]}
                              onChange={(e) => handleInputChange(field as keyof FormData, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {fieldConfig.options?.map((option: string) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={fieldConfig.type}
                            value={formData[field as keyof FormData]}
                            onChange={(e) => handleInputChange(field as keyof FormData, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  })}

                     {/* Signature Image Upload */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         <div className="flex items-center space-x-2">
                           <PenTool className="w-4 h-4" />
                           <span>Signature Image (PNG)</span>
                         </div>
                       </label>
                       <input
                         type="file"
                         accept=".png,.jpg,.jpeg"
                         onChange={handleSignatureImageUpload}
                         className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                       />
                       {formData.signatureImage && (
                         <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                           <p className="text-sm text-green-700">✓ Signature image uploaded successfully</p>
                         </div>
                       )}
                     </div>

                     {/* Signatory Details - Always shown */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         <div className="flex items-center space-x-2">
                           <PenTool className="w-4 h-4" />
                           <span>Signatory Name</span>
                         </div>
                       </label>
                       <input
                         type="text"
                         value={formData.signatoryName}
                         onChange={(e) => handleInputChange('signatoryName', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="Enter signatory name"
                       />
                     </div>

                      
                   </div>
                 </div>
               </div>
             </div>

            {/* Preview Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Letter Preview</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadPDFWithBackground}
                      disabled={!selectedBackgroundImage || isGenerating}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isGenerating ? 'Generating...' : 'PDF with Background'}</span>
                    </button>
                    <button
                      onClick={downloadLetter}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Simple PDF</span>
                    </button>
                  </div>
                </div>

                {/* PDF Preview */}
                <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '210/297' }}>
                  {/* Background Image */}
                  {selectedBackgroundImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${selectedBackgroundImage})`,
                        opacity: 0.3
                      }}
                    />
                  )}
                  
                  {/* Content Overlay */}
                  <div className="relative z-10 p-8 h-full flex flex-col">
                    <div className="flex-1 pt-32">
                      <div 
                        className="text-gray-800 leading-relaxed"
                        style={{ 
                          fontSize: '14px',
                          lineHeight: '1.6',
                          fontFamily: 'Times New Roman, serif'
                        }}
                      >
                        {(() => {
                          const TemplateComponent = templates[activeTemplate].component;
                          return <TemplateComponent formData={formData} formatDate={formatDate} />;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Image Status */}
                {!selectedBackgroundImage && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ No background image uploaded. Upload a background image to see the full preview.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Upload your PNG background image (A4 format recommended)</li>
                    <li>• Choose your preferred PDF quality level</li>
                    <li>• Fill in the required fields in the left panel</li>
                    <li>• Preview updates automatically as you type</li>
                    <li>• Click "PDF with Background" to create a professional document</li>
                    <li>• Or click "Simple PDF" for a basic version</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

                     {/* Company Info Section */}
           <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-lg font-semibold mb-4 text-gray-800">Company Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                 <input
                   type="text"
                   value={formData.companyName}
                   onChange={(e) => handleInputChange('companyName', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                 <input
                   type="text"
                   value={formData.contactPhone}
                   onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                 <input
                   type="email"
                   value={formData.contactEmail}
                   onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
                 </div>
               </div>
             </div>
           </div>


        </div>
      </div>
    </div>
  );
};

export default HRPortal;