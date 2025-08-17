import { FileText, Download, DollarSign, PenTool, Building, ArrowRight, ArrowLeft } from 'lucide-react';

const DocumentSelectionPage = () => {
  const handleDocumentSelect = (documentType: string) => {
    // Navigate to the main HR Portal with the selected document type
    window.location.href = `/portal?type=${documentType}`;
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const documentTypes = [
    {
      id: 'loe',
      title: 'Letter of Employment (LOE)',
      description: 'Professional employment verification letters with customizable content and company branding.',
      icon: <FileText className="w-12 h-12 text-blue-600" />,
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      features: [
        'Employee details and position',
        'Joining date and salary information',
        'Company contact details',
        'Digital signature integration'
      ]
    },
    {
      id: 'experience',
      title: 'Experience Certificate',
      description: 'Comprehensive experience certificates highlighting employee contributions and achievements.',
      icon: <Building className="w-12 h-12 text-green-600" />,
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      features: [
        'Employment duration details',
        'Role and responsibilities',
        'Performance acknowledgment',
        'Professional formatting'
      ]
    },
    {
      id: 'salary',
      title: 'Salary Certificate',
      description: 'Official salary verification documents for financial institutions and official purposes.',
      icon: <DollarSign className="w-12 h-12 text-purple-600" />,
      borderColor: 'border-purple-200',
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
      features: [
        'Current salary information',
        'Currency and payment frequency',
        'Employment verification',
        'Official company stamp'
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HR Portal</span>
            </div>
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Document Type
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the type of document you want to create. Each template is professionally designed 
              and fully customizable to meet your specific needs.
            </p>
          </div>

          {/* Document Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {documentTypes.map((docType) => (
              <div
                key={docType.id}
                className={`bg-gradient-to-br ${docType.color} p-8 rounded-xl border ${docType.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                onClick={() => handleDocumentSelect(docType.id)}
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {docType.icon}
                  </div>
                  <h3 className={`text-2xl font-bold ${docType.textColor} mb-3`}>
                    {docType.title}
                  </h3>
                  <p className={`${docType.textColor} opacity-80 mb-6`}>
                    {docType.description}
                  </p>
                </div>

                {/* Features List */}
                <ul className={`${docType.textColor} space-y-2 mb-6`}>
                  {docType.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    className={`bg-white ${docType.textColor} px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 mx-auto group-hover:scale-105`}
                  >
                    <span>Create {docType.title.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                All Documents Include
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Custom Branding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">High-Quality PDF</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Professional Templates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSelectionPage;
