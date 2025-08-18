# Template Development Guide

This guide explains how to add new templates to the HR Portal system. The new modular architecture makes it easy to add 20+ templates without cluttering the main codebase.

## 🏗️ Architecture Overview

The template system is now organized into separate components:

```
src/components/templates/
├── TemplateRegistry.tsx      # Central template registry
├── LOETemplate.tsx           # Letter of Employment template
├── ExperienceTemplate.tsx    # Experience Certificate template
├── SalaryTemplate.tsx        # Salary Certificate template
└── ReferenceTemplate.tsx     # Example: Reference Letter template
```

## 📝 How to Add a New Template

### Step 1: Create the Template Component

Create a new file in `src/components/templates/` with your template name:

```typescript
// src/components/templates/YourTemplate.tsx
import React from 'react';

interface YourTemplateProps {
  formData: {
    employeeName: string;
    position: string;
    companyName: string;
    signatoryName: string;
    signatoryTitle: string;
    contactEmail: string;
    signatureImage?: string;
    // Add any additional fields your template needs
  };
  formatDate?: (dateString: string) => string; // Optional if you need date formatting
}

const YourTemplate: React.FC<YourTemplateProps> = ({ formData, formatDate }) => {
  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-xl font-bold mb-2">YOUR TEMPLATE TITLE</h1>
      </div>
      
      <div className="mb-4 text-left">
        <p className="mb-4">
          Your template content here with dynamic data: {formData.employeeName}
        </p>
      </div>
      
      <div className="mt-8 text-left">
        {formData.signatureImage && (
          <div className="text-left mb-4">
            <img 
              src={formData.signatureImage} 
              alt="Signature" 
              className="max-w-32 h-auto"
            />
          </div>
        )}
        <p className="font-semibold">{formData.signatoryName || '[Signatory Name]'}</p>
        <p>{formData.signatoryTitle}</p>
        <p>{formData.companyName}</p>
        <p>{formData.contactEmail}</p>
      </div>
    </div>
  );
};

export default YourTemplate;
```

### Step 2: Update the Template Registry

Add your template to `src/components/templates/TemplateRegistry.tsx`:

```typescript
// 1. Import your template
import YourTemplate from './YourTemplate';

// 2. Add to TemplateKey type
export type TemplateKey = 'loe' | 'experience' | 'salary' | 'your-template';

// 3. Add to templates object
export const templates: Record<TemplateKey, Template> = {
  // ... existing templates
  'your-template': {
    name: 'Your Template Name',
    icon: <FileText className="w-5 h-5" />, // Choose appropriate icon
    fields: ['employeeName', 'position', 'companyName'], // Fields this template needs
    backgroundImage: '/templates/your_template_background.png',
    component: YourTemplate
  }
};
```

### Step 3: Update PDF Generator (Optional)

If you need custom text generation for PDFs, add a method to `src/components/PDFGenerator.ts`:

```typescript
private generateYourTemplate(data: TemplateData): string {
  return `YOUR TEMPLATE TITLE

This is to certify that ${data.employeeName ? `Mr./Ms. ${data.employeeName}` : '[Employee Name]'}...

${data.signatoryName || '[Signatory Name]'}
${data.signatoryTitle}
${data.companyName}`;
}

// Update getGeneratedContent method
private getGeneratedContent(data: TemplateData, documentType: TemplateKey): string {
  switch (documentType) {
    case 'loe': return this.generateLOE(data);
    case 'experience': return this.generateExperienceCert(data);
    case 'salary': return this.generateSalaryCert(data);
    case 'your-template': return this.generateYourTemplate(data);
    default: return this.generateLOE(data);
  }
}
```

### Step 4: Update Document Selection Page

Add your template to the document selection cards in `src/components/DocumentSelectionPage.tsx`:

```typescript
const documentTypes = [
  // ... existing document types
  {
    id: 'your-template',
    title: 'Your Template Name',
    description: 'Description of what this template does.',
    icon: <FileText className="w-12 h-12 text-blue-600" />,
    color: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3'
    ]
  }
];
```

## 🎨 Template Styling Guidelines

### Required CSS Classes
- Use `text-left` for left-aligned content
- Use `mb-4` for paragraph spacing
- Use `mt-8` for signature section spacing
- Use `font-semibold` for signatory name
- Use `max-w-32 h-auto` for signature images

### Layout Structure
```typescript
<div>
  {/* Header */}
  <div className="text-left mb-6">
    <h1 className="text-xl font-bold mb-2">TEMPLATE TITLE</h1>
  </div>
  
  {/* Content */}
  <div className="mb-4 text-left">
    <p className="mb-4">Content paragraphs...</p>
  </div>
  
  {/* Signature Section */}
  <div className="mt-8 text-left">
    {/* Signature Image */}
    {/* Signatory Details */}
  </div>
</div>
```

## 🔧 Template Configuration Options

### Available Icons
```typescript
import { FileText, DollarSign, Building, User, Calendar, PenTool } from 'lucide-react';
```

### Field Types
- `employeeName` - Employee's full name
- `joiningDate` - Employment start date
- `salary` - Salary amount
- `currency` - Currency (USD, BDT, EUR, GBP)
- `position` - Job title/position
- `companyName` - Company name
- `signatoryName` - Signatory's name
- `signatoryTitle` - Signatory's title
- `contactPhone` - Contact phone number
- `contactEmail` - Contact email
- `website` - Company website
- `signatureImage` - Digital signature image

### Background Images
Place your template background images in the `public/templates/` directory:
- Recommended format: PNG
- Recommended size: A4 (210mm x 297mm)
- File naming: `your_template_background.png`

## 🚀 Example: Adding a Reference Letter Template

See `src/components/templates/ReferenceTemplate.tsx` for a complete example of a new template implementation.

## 📋 Best Practices

1. **Consistent Naming**: Use kebab-case for template IDs (`reference-letter`)
2. **Type Safety**: Always define proper TypeScript interfaces
3. **Reusable Fields**: Use existing form fields when possible
4. **Responsive Design**: Ensure templates work on all screen sizes
5. **Accessibility**: Use semantic HTML and proper alt text for images
6. **Testing**: Test both preview and PDF generation

## 🔄 Adding 20+ Templates

With this architecture, you can easily add 20+ templates by:

1. Creating individual template components
2. Adding them to the registry
3. Updating the document selection page
4. Optionally adding PDF generation methods

The system will automatically handle:
- Template switching
- Form field management
- Preview rendering
- PDF generation
- Navigation

## 🎯 Benefits of This Architecture

- **Modular**: Each template is self-contained
- **Scalable**: Easy to add new templates
- **Maintainable**: Changes to one template don't affect others
- **Type Safe**: Full TypeScript support
- **Reusable**: Common components and utilities
- **Testable**: Individual templates can be tested separately
