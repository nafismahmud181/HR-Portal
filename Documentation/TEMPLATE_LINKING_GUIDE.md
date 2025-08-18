# HR Portal - Template Linking Guide

## 🎯 Overview

The HR Portal now has functional template linking that allows users to directly navigate from the template showcase to the document creation portal for available templates.

## 🔗 How Template Linking Works

### Available Templates (Linked)
The following templates are fully functional and link directly to the document creation portal:

#### 1. **Letter of Employment (LOE)** 
- **Template ID**: `offer-letter`
- **Navigation**: `/portal?type=loe`
- **Status**: ✅ Available
- **Functionality**: Full document creation with custom backgrounds and signatures

#### 2. **Experience Certificate**
- **Template ID**: `experience-certificate`
- **Navigation**: `/portal?type=experience`
- **Status**: ✅ Available
- **Functionality**: Full document creation with custom backgrounds and signatures

#### 3. **Salary Certificate**
- **Template ID**: `salary-certificate`
- **Navigation**: `/portal?type=salary`
- **Status**: ✅ Available
- **Functionality**: Full document creation with custom backgrounds and signatures

### Coming Soon Templates (Placeholder)
- **Status**: 🟡 Coming Soon
- **Functionality**: Shows alert message "Template will be implemented soon!"
- **Examples**: Employment Contract, Employee Handbook, Leave Policy

### Planned Templates (Placeholder)
- **Status**: ⚪ Planned
- **Functionality**: Shows alert message "Template will be implemented soon!"
- **Examples**: Job Descriptions, Internship Agreement, Performance Appraisal

## 🚀 User Experience Flow

### For Available Templates:
1. **Browse Templates**: User visits `/templates` page
2. **Identify Available**: Green "Available" badge on template cards
3. **Click Create**: "Create Document" button appears on available templates
4. **Navigate to Portal**: Automatically redirects to `/portal?type={template-type}`
5. **Pre-selected Template**: Portal opens with correct template pre-selected
6. **Create Document**: User can immediately start filling form and creating documents

### For Other Templates:
1. **Browse Templates**: User visits `/templates` page
2. **Identify Status**: Yellow "Coming Soon" or Gray "Planned" badges
3. **Click Template**: Shows informative alert about future availability
4. **Stay on Page**: User remains on template showcase page

## 🎨 Visual Indicators

### Template Cards:
- **Available Templates**: 
  - Blue border (`border-blue-200`)
  - Hover effects (shadow, border color change)
  - "Create Document" button
  - Cursor pointer
  
- **Coming Soon/Planned Templates**:
  - Gray border (`border-gray-200`)
  - Reduced opacity (`opacity-75`)
  - No action button
  - Cursor default

### Status Badges:
- **🟢 Available**: Green background with green text
- **🟡 Coming Soon**: Yellow background with yellow text  
- **⚪ Planned**: Gray background with gray text

### Priority Indicators:
- **🔴 High Priority**: Red text
- **🟡 Medium Priority**: Yellow text
- **🟢 Low Priority**: Green text

## 🔧 Technical Implementation

### Navigation Function:
```typescript
const handleTemplateClick = (templateId: string) => {
  switch (templateId) {
    case 'offer-letter':
      navigate('/portal?type=loe');
      break;
    case 'experience-certificate':
      navigate('/portal?type=experience');
      break;
    case 'salary-certificate':
      navigate('/portal?type=salary');
      break;
    default:
      alert(`Template "${templateId}" will be implemented soon!`);
  }
};
```

### URL Parameters:
- **LOE**: `/portal?type=loe`
- **Experience**: `/portal?type=experience`
- **Salary**: `/portal?type=salary`

### Portal Integration:
The portal automatically reads the `type` parameter and pre-selects the correct template:
```typescript
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const documentType = urlParams.get('type');
  
  if (documentType && ['loe', 'experience', 'salary'].includes(documentType)) {
    setActiveTemplate(documentType as TemplateKey);
  }
}, []);
```

## 📱 User Interface Elements

### Template Count Summary:
- **Header Section**: Shows total counts (3 Available, 12 Coming Soon, 20 Planned)
- **Visual Legend**: Color-coded indicators for each status

### Action Buttons:
- **Create Document**: Blue button for available templates
- **View Available Templates**: Links to `/documents` page
- **Back to Home**: Returns to landing page

### Available Templates Info Box:
- **Location**: Footer section
- **Content**: Lists all 3 available templates
- **Instructions**: Clear guidance on how to use available templates

## 🔄 Integration Points

### Current Integration:
- **Template Showcase** ↔ **Document Portal**: Direct navigation with pre-selection
- **Sidebar Navigation**: Seamless movement between pages
- **Landing Page**: "View All Templates" button

### Future Integration:
- **Template Registry**: Will connect with modular template system
- **PDF Generator**: Already integrated for available templates
- **User Management**: Ready for role-based access control

## 📊 Template Status Distribution

### Total Templates: 35
- **✅ Available**: 3 templates (8.6%) - **FULLY FUNCTIONAL**
- **🟡 Coming Soon**: 12 templates (34.3%) - **PLACEHOLDER**
- **⚪ Planned**: 20 templates (57.1%) - **PLACEHOLDER**

### By Category:
1. **Employment & Hiring**: 1 available, 1 coming soon, 3 planned
2. **Employee Verification & Certificates**: 2 available, 1 coming soon, 2 planned
3. **Payroll & Benefits**: 0 available, 2 coming soon, 3 planned
4. **Policies & Compliance**: 0 available, 2 coming soon, 4 planned
5. **Performance & Development**: 0 available, 2 coming soon, 2 planned
6. **Exit & Offboarding**: 0 available, 1 coming soon, 3 planned
7. **Other Communications**: 0 available, 1 coming soon, 3 planned

## 🎯 Benefits of Template Linking

### For Users:
- **Immediate Access**: Available templates are one click away
- **Clear Status**: Know exactly which templates are ready to use
- **Seamless Workflow**: Direct navigation to document creation
- **Pre-selection**: Correct template automatically selected

### For Development:
- **Clear Roadmap**: Visual representation of development progress
- **User Feedback**: Users can see what's coming and when
- **Priority Planning**: Development priorities clearly indicated
- **Scalable Architecture**: Easy to add new templates as they become available

## 🚀 Next Steps

### Phase 1: Complete Current Templates
- ✅ LOE, Experience, Salary templates are fully functional
- ✅ Template linking and navigation working
- ✅ Portal integration complete

### Phase 2: Implement Coming Soon Templates
- 🟡 Employment Contract / Agreement
- 🟡 Employee Handbook
- 🟡 Leave Policy + Application Form
- 🟡 And 9 more templates...

### Phase 3: Add Planned Templates
- ⚪ Job Descriptions
- ⚪ Performance Appraisal Forms
- ⚪ Exit Interview Forms
- ⚪ And 17 more templates...

## 📚 Related Documentation

- **Template Development Guide**: How to add new templates
- **Template Registry**: Central template management system
- **PDF Generator**: Document generation functionality
- **Portal Component**: Main document creation interface

---

This template linking system provides a solid foundation for the HR Portal, allowing users to immediately access available functionality while providing a clear roadmap for future development.
