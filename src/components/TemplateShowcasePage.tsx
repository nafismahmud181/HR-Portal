import React from 'react';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Shield, 
  TrendingUp, 
  LogOut, 
  MessageSquare,
  ArrowLeft,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  Handshake,
  CreditCard,
  FileCheck,
  Users,
  BookOpen,
  Globe,
  Lock,
  Eye,
  Star,
  Target,
  GraduationCap,
  ThumbsUp,
  MapPin,
  Plane
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SideNavbar from './SideNavbar';

interface TemplateCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  borderColor: string;
  textColor: string;
  templates: Template[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  status: 'available' | 'coming-soon' | 'planned';
  priority: 'high' | 'medium' | 'low';
}

const TemplateShowcasePage = () => {
  const navigate = useNavigate();

  const templateCategories: TemplateCategory[] = [
    {
      id: 'employment-hiring',
      title: 'Employment & Hiring',
      description: 'Essential documents for new employee onboarding and hiring processes',
      icon: <Briefcase className="w-8 h-8 text-blue-600" />,
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      templates: [
        {
          id: 'offer-letter',
          name: 'Offer Letter (LOE / Appointment Letter)',
          description: 'Formal employment offer with terms and conditions',
          icon: <FileText className="w-6 h-6" />,
          status: 'available',
          priority: 'high'
        },
        {
          id: 'employment-contract',
          name: 'Employment Contract / Agreement',
          description: 'Detailed employment terms for probationary & permanent roles',
          icon: <Handshake className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'job-description',
          name: 'Job Descriptions (per role)',
          description: 'Comprehensive role descriptions and responsibilities',
          icon: <Target className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'internship-agreement',
          name: 'Internship Agreement',
          description: 'Terms and conditions for internship programs',
          icon: <GraduationCap className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'onboarding-checklist',
          name: 'Onboarding Checklist',
          description: 'Comprehensive checklist for new employee onboarding',
          icon: <CheckCircle className="w-6 h-6" />,
          status: 'planned',
          priority: 'low'
        }
      ]
    },
    {
      id: 'verification-certificates',
      title: 'Employee Verification & Certificates',
      description: 'Official certificates and verification documents',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      color: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      templates: [
        {
          id: 'salary-certificate',
          name: 'Salary Certificate',
          description: 'Official salary verification document',
          icon: <DollarSign className="w-6 h-6" />,
          status: 'available',
          priority: 'high'
        },
        {
          id: 'experience-certificate',
          name: 'Experience / Employment Certificate',
          description: 'Employment history and experience verification',
          icon: <FileText className="w-6 h-6" />,
          status: 'available',
          priority: 'high'
        },
        {
          id: 'relieving-letter',
          name: 'Relieving Letter',
          description: 'Official letter when employee resigns',
          icon: <LogOut className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'noc',
          name: 'No Objection Certificate (NOC)',
          description: 'Permission letter for external activities',
          icon: <CheckCircle className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'reference-letter',
          name: 'Reference Letter',
          description: 'Professional reference for past employees',
          icon: <Users className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'payroll-benefits',
      title: 'Payroll & Benefits',
      description: 'Salary, compensation, and benefits related documents',
      icon: <CreditCard className="w-8 h-8 text-purple-600" />,
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      templates: [
        {
          id: 'salary-structure',
          name: 'Salary Structure Template',
          description: 'Detailed salary breakdown and components',
          icon: <DollarSign className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'payslip-format',
          name: 'Payslip Format',
          description: 'Standardized payslip template',
          icon: <FileText className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'loan-request',
          name: 'Loan / Advance Request Form',
          description: 'Employee loan and advance application',
          icon: <CreditCard className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'reimbursement-claim',
          name: 'Reimbursement Claim Form',
          description: 'Travel, medical, and other expense claims',
          icon: <FileCheck className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'overtime-approval',
          name: 'Overtime / Extra Hours Approval Form',
          description: 'Overtime work authorization and approval',
          icon: <Clock className="w-6 h-6" />,
          status: 'planned',
          priority: 'low'
        }
      ]
    },
    {
      id: 'policies-compliance',
      title: 'Policies & Compliance',
      description: 'Company policies, rules, and compliance documents',
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      color: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      templates: [
        {
          id: 'employee-handbook',
          name: 'Employee Handbook',
          description: 'Basic rules, working hours, leave, code of conduct',
          icon: <BookOpen className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'leave-policy',
          name: 'Leave Policy + Leave Application Form',
          description: 'Leave policies and application procedures',
          icon: <Calendar className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'remote-work-policy',
          name: 'Remote Work / WFH Policy',
          description: 'Work from home guidelines and procedures',
          icon: <Globe className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'it-security-policy',
          name: 'IT & Data Security Policy',
          description: 'Information technology and data protection rules',
          icon: <Lock className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'nda',
          name: 'NDA (Non-Disclosure Agreement)',
          description: 'Confidentiality and non-disclosure agreement',
          icon: <Eye className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'conflict-interest',
          name: 'Conflict of Interest Declaration',
          description: 'Declaration of potential conflicts of interest',
          icon: <AlertTriangle className="w-6 h-6" />,
          status: 'planned',
          priority: 'low'
        }
      ]
    },
    {
      id: 'performance-development',
      title: 'Performance & Development',
      description: 'Performance management and career development documents',
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      color: 'from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-900',
      templates: [
        {
          id: 'probation-confirmation',
          name: 'Probation Confirmation Letter',
          description: 'Confirmation of successful probation period',
          icon: <CheckCircle className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'promotion-letter',
          name: 'Promotion Letter',
          description: 'Official promotion notification and terms',
          icon: <TrendingUp className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'performance-appraisal',
          name: 'Performance Appraisal Form',
          description: 'Comprehensive performance evaluation template',
          icon: <Star className="w-6 h-6" />,
          status: 'planned',
          priority: 'high'
        },
        {
          id: 'training-nomination',
          name: 'Training Nomination / Feedback Form',
          description: 'Training program nomination and feedback',
          icon: <GraduationCap className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'exit-offboarding',
      title: 'Exit & Offboarding',
      description: 'Employee separation and offboarding documents',
      icon: <LogOut className="w-8 h-8 text-red-600" />,
      color: 'from-red-50 to-red-100',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      templates: [
        {
          id: 'resignation-acceptance',
          name: 'Resignation Acceptance Letter',
          description: 'Official acceptance of employee resignation',
          icon: <FileText className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'high'
        },
        {
          id: 'exit-interview',
          name: 'Exit Interview Form',
          description: 'Structured exit interview questionnaire',
          icon: <MessageSquare className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'final-settlement',
          name: 'Final Settlement Statement',
          description: 'Complete financial settlement details',
          icon: <DollarSign className="w-6 h-6" />,
          status: 'planned',
          priority: 'high'
        },
        {
          id: 'clearance-form',
          name: 'Full & Final Clearance Form',
          description: 'Complete clearance checklist for departing employees',
          icon: <CheckCircle className="w-6 h-6" />,
          status: 'planned',
          priority: 'high'
        }
      ]
    },
    {
      id: 'other-communications',
      title: 'Other Communications',
      description: 'Miscellaneous HR communications and letters',
      icon: <MessageSquare className="w-8 h-8 text-teal-600" />,
      color: 'from-teal-50 to-teal-100',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-900',
      templates: [
        {
          id: 'warning-letter',
          name: 'Warning / Disciplinary Action Letter',
          description: 'Formal warning and disciplinary communication',
          icon: <AlertTriangle className="w-6 h-6" />,
          status: 'coming-soon',
          priority: 'medium'
        },
        {
          id: 'appreciation-letter',
          name: 'Appreciation / Recognition Letter',
          description: 'Employee recognition and appreciation',
          icon: <ThumbsUp className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'transfer-letter',
          name: 'Transfer Letter',
          description: 'Official transfer notification and details',
          icon: <MapPin className="w-6 h-6" />,
          status: 'planned',
          priority: 'medium'
        },
        {
          id: 'travel-authorization',
          name: 'Travel Authorization Letter',
          description: 'Official travel permission and authorization',
          icon: <Plane className="w-6 h-6" />,
          status: 'planned',
          priority: 'low'
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'coming-soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleTemplateClick = (templateId: string) => {
    // For now, just show an alert. Later this will navigate to template creation
    alert(`Template "${templateId}" will be implemented soon!`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Side Navbar */}
      <SideNavbar currentPage="templates" />

      {/* Main Content with Fixed Left Margin for Sidebar */}
      <div className="ml-20">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900">Template Showcase</span>
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
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                HR Template Library
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Comprehensive collection of professional HR documents and templates
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Coming Soon</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span>Planned</span>
                </div>
              </div>
            </div>

            {/* Template Categories */}
            <div className="space-y-12">
              {templateCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${category.color} p-6 border-b ${category.borderColor}`}>
                    <div className="flex items-center space-x-4">
                      {category.icon}
                      <div>
                        <h2 className={`text-2xl font-bold ${category.textColor}`}>
                          {category.title}
                        </h2>
                        <p className={`text-lg ${category.textColor} opacity-80`}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Templates Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateClick(template.id)}
                          className={`bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                            template.status === 'available' ? 'hover:border-blue-300' : 'opacity-75'
                          }`}
                        >
                          {/* Template Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-600">
                                {template.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {template.name}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Template Description */}
                          <p className="text-gray-600 text-sm mb-4">
                            {template.description}
                          </p>

                          {/* Template Status and Priority */}
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                              {template.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(template.priority)}`}>
                              {template.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose from our comprehensive collection of HR templates. Available templates are ready to use, while others are coming soon!
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigate('/documents')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Available Templates
                  </button>
                  <button
                    onClick={handleBackToHome}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateShowcasePage;
