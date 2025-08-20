import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Shield, 
  TrendingUp, 
  LogOut, 
  MessageSquare,
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
  Plane,
  Search,
  X
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

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



  // Filter templates based on search query, category, and status
  const filteredTemplateCategories = useMemo(() => {
    return templateCategories.map(category => ({
      ...category,
      templates: category.templates.filter(template => {
        const matchesSearch = searchQuery === '' || 
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
    })).filter(category => category.templates.length > 0);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleTemplateClick = (templateId: string) => {
    // Check if template is available and navigate accordingly
    switch (templateId) {
      case 'offer-letter':
        // LOE template - navigate to portal with type=loe
        navigate('/portal?type=loe');
        break;
      case 'experience-certificate':
        // Experience template - navigate to portal with type=experience
        navigate('/portal?type=experience');
        break;
      case 'salary-certificate':
        // Salary template - navigate to portal with type=salary
        navigate('/portal?type=salary');
        break;
      default:
        // For other templates, show coming soon message
        alert(`Template "${templateId}" will be implemented soon!`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Side Navbar */}
      <SideNavbar currentPage="templates" />

      {/* Main Content with Fixed Left Margin for Sidebar */}
      <div className="ml-20">
        {/* Navigation Header */}
        {/* <nav className="bg-white shadow-sm border-b w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-gray-900">Template Showcase</span>
              </div>
            </div>
          </div>
        </nav> */}

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
                         Header
             <div className="text-center mb-12">
               <h1 className="text-4xl font-bold text-gray-800 mb-4">
                 HR Template Library
               </h1>
                               <p className="text-xl text-gray-600 mb-6">
                  Comprehensive collection of professional HR documents and templates
                </p>
                
                {/* Search and Filter Section */}
                <div className="max-w-4xl mx-auto mb-8">
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search templates by name, description, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2  text-gray-900 placeholder-gray-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                    >
                      <option value="all">All Categories</option>
                      {templateCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                    
                    {/* Status Filter */}
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="coming-soon">Coming Soon</option>
                      <option value="planned">Planned</option>
                    </select>
                    
                    {/* Clear Filters Button */}
                    {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Summary */}
                  {searchQuery && (
                    <div className="text-center mt-3">
                      <p className="text-sm text-gray-600">
                        Showing {filteredTemplateCategories.reduce((total, cat) => total + cat.templates.length, 0)} results for "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

                                      {/* Template Categories */}
             {filteredTemplateCategories.length > 0 ? (
               <div className="space-y-12">
                 {filteredTemplateCategories.map((category) => (
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
                             className={`bg-white border-2 rounded-lg p-6 transition-all duration-200 ${
                               template.status === 'available' 
                                 ? 'border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer' 
                                 : 'border-gray-200 opacity-75 cursor-default'
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
                             <div className="flex items-center justify-between mb-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(template.status)}`}>
                                 {template.status.replace('-', ' ').toUpperCase()}
                               </span>
                               <span className={`text-xs font-medium ${getPriorityColor(template.priority)}`}>
                                 {template.priority.toUpperCase()} PRIORITY
                               </span>
                             </div>

                             {/* Action Button for Available Templates */}
                             {template.status === 'available' && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleTemplateClick(template.id);
                                 }}
                                 className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                               >
                                 Create Document
                               </button>
                               )}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               /* No Results Message */
               <div className="text-center py-16">
                 <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
                   <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                   <h3 className="text-2xl font-bold text-gray-800 mb-2">No templates found</h3>
                   <p className="text-gray-600 mb-6">
                     {searchQuery 
                       ? `No templates match your search for "${searchQuery}"`
                       : 'No templates match your current filters'
                     }
                   </p>
                   <div className="flex flex-wrap gap-3 justify-center">
                     <button
                       onClick={clearSearch}
                       className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                     >
                       Clear All Filters
                     </button>
                     <button
                       onClick={() => navigate('/documents')}
                       className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                     >
                       View Available Templates
                     </button>
                   </div>
                 </div>
               </div>
             )}

                         {/* Footer */}
             <div className="mt-12 text-center">
               <div className="bg-white rounded-xl shadow-lg p-8">
                 <h3 className="text-2xl font-bold text-gray-800 mb-4">
                   Ready to Get Started?
                 </h3>
                 <p className="text-gray-600 mb-6">
                   Choose from our comprehensive collection of HR templates. Available templates are ready to use, while others are coming soon!
                 </p>
                 
                 {/* Available Templates Info */}
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                   <h4 className="font-semibold text-blue-800 mb-2">✨ Available Templates:</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                     <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                       <span className="text-blue-700">Letter of Employment (LOE)</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                       <span className="text-blue-700">Experience Certificate</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                       <span className="text-blue-700">Salary Certificate</span>
                     </div>
                   </div>
                   <p className="text-blue-600 text-xs mt-2">
                     Click "Create Document" on any available template to start generating professional HR documents!
                   </p>
                 </div>
                 
                 <div className="flex justify-center space-x-4">
                   <button
                     onClick={() => navigate('/documents')}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                   >
                     View Available Templates
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
