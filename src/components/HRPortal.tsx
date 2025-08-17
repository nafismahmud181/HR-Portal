import React, { useState } from 'react';
import { FileText, Download, User, Calendar, DollarSign, PenTool, Building } from 'lucide-react';
import { generatePDF } from './PDFGenerator';

// Define types for better type safety
type TemplateKey = 'loe' | 'experience' | 'salary';
type QualityLevel = 'standard' | 'high' | 'ultra';

interface Template {
  name: string;
  icon: React.ReactElement;
  fields: (keyof FormData)[];
  backgroundImage: string;
}

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
}

interface InputField {
  label: string;
  icon: React.ReactElement;
  type: string;
  options?: string[];
}

const HRPortal = () => {
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
    signatoryName: '',
    signatoryTitle: 'Proprietor',
    contactPhone: '+880 1789 490 105',
    contactEmail: 'info@inteliweave.com.bd',
    website: 'www.inteliweave.com.bd'
  });

  const templates: Record<TemplateKey, Template> = {
    loe: {
      name: 'Letter of Employment (LOE)',
      icon: <FileText className="w-5 h-5" />,
      fields: ['employeeName', 'joiningDate', 'salary', 'currency', 'position'],
      backgroundImage: '/templates/loe_background.png'
    },
    experience: {
      name: 'Experience Certificate',
      icon: <FileText className="w-5 h-5" />,
      fields: ['employeeName', 'joiningDate', 'position'],
      backgroundImage: '/templates/experience_background.png'
    },
    salary: {
      name: 'Salary Certificate',
      icon: <DollarSign className="w-5 h-5" />,
      fields: ['employeeName', 'salary', 'currency', 'position'],
      backgroundImage: '/templates/salary_background.png'
    }
  };

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

  const generateLOE = (): string => {
    return `To Whom It May Concern:

Dear Sir/Madam,

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is an employee at ${formData.companyName}, and ${formData.employeeName ? 'he/she' : 'they'} has been working as a ${formData.position} since ${formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}. ${formData.employeeName ? 'His/Her' : 'Their'} current salary is ${formData.currency} ${formData.salary || '[Salary Amount]'}, paid bi-weekly.

If you have any questions regarding ${formData.employeeName ? `${formData.employeeName}'s` : 'the employee\'s'} employment, please contact our office at ${formData.contactPhone} or ${formData.contactEmail}.


${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.contactEmail}
${formData.website}`;
  };

  const generateExperienceCert = (): string => {
    return `TO WHOM IT MAY CONCERN

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} has been working with ${formData.companyName} as ${formData.position} since ${formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}.

During ${formData.employeeName ? 'his/her' : 'their'} tenure, ${formData.employeeName ? 'he/she' : 'they'} has shown dedication, professionalism, and excellent work performance.

We wish ${formData.employeeName ? 'him/her' : 'them'} all the best for future endeavors.


${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.companyName}`;
  };

  const generateSalaryCert = (): string => {
    return `SALARY CERTIFICATE

This is to certify that ${formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is currently employed with ${formData.companyName} as ${formData.position}.

${formData.employeeName ? 'His/Her' : 'Their'} current monthly salary is ${formData.currency} ${formData.salary || '[Salary Amount]'}.

This certificate is being issued upon ${formData.employeeName ? 'his/her' : 'their'} request.


${formData.signatoryName || '[Signatory Name]'}
${formData.signatoryTitle}
${formData.companyName}
${formData.contactEmail}`;
  };

  const getGeneratedContent = (): string => {
    switch(activeTemplate) {
      case 'loe': return generateLOE();
      case 'experience': return generateExperienceCert();
      case 'salary': return generateSalaryCert();
      default: return generateLOE();
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store the file path or handle the upload
      setSelectedBackgroundImage(URL.createObjectURL(file));
    }
  };

  const downloadPDFWithBackground = async (): Promise<void> => {
    if (!selectedBackgroundImage) {
      alert('Please upload a background image first');
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(selectedBackgroundImage, formData, activeTemplate, qualityLevel);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = (): void => {
    const content = getGeneratedContent();
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download the letter');
      return;
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
    printWindow.onload = () => {
      setTimeout(() => {
        if (printWindow) {
          printWindow.print();
          printWindow.close();
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
    website: { label: 'Website', icon: <Building className="w-4 h-4" />, type: 'text' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">HR Portal</h1>
          <p className="text-gray-600">Generate professional employment letters with custom backgrounds</p>
        </div>

        {/* Background Image Upload Section */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Background Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={handleBackgroundImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={downloadPDFWithBackground}
              disabled={!selectedBackgroundImage || isGenerating}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
            </button>
            <div className="text-sm text-gray-600">
              <p>Quality: <span className="font-semibold">
                {qualityLevel === 'standard' ? 'Standard (2x)' : 
                 qualityLevel === 'high' ? 'High (4x)' : 'Ultra HD (6x)'}
              </span></p>
              <p>File size will be larger with higher quality</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Upload your PNG background image (A4 format recommended). The text will be overlaid on top.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Template</h2>
              <div className="space-y-3">
                {Object.entries(templates).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTemplate(key as TemplateKey)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                      activeTemplate === key
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {template.icon}
                    <span className="font-medium">{template.name}</span>
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Letter Details</h3>
                <div className="space-y-4">
                  {templates[activeTemplate].fields.map(field => {
                    const fieldConfig = inputFields[field];
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
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {fieldConfig.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={fieldConfig.type}
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  })}

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

              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {getGeneratedContent()}
                </pre>
              </div>

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
  );
};

export default HRPortal;