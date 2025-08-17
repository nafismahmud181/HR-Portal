import React from 'react';
import { FileText, DollarSign } from 'lucide-react';
import LOETemplate from './LOETemplate';
import ExperienceTemplate from './ExperienceTemplate';
import SalaryTemplate from './SalaryTemplate';

export type TemplateKey = 'loe' | 'experience' | 'salary';

export interface Template {
  name: string;
  icon: React.ReactElement;
  fields: string[];
  backgroundImage: string;
  component: React.ComponentType<any>;
}

export interface FormData {
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
  signatureImage?: string;
}

export const templates: Record<TemplateKey, Template> = {
  loe: {
    name: 'Letter of Employment (LOE)',
    icon: <FileText className="w-5 h-5" />,
    fields: ['employeeName', 'joiningDate', 'salary', 'currency', 'position'],
    backgroundImage: '/templates/loe_background.png',
    component: LOETemplate
  },
  experience: {
    name: 'Experience Certificate',
    icon: <FileText className="w-5 h-5" />,
    fields: ['employeeName', 'joiningDate', 'position'],
    backgroundImage: '/templates/experience_background.png',
    component: ExperienceTemplate
  },
  salary: {
    name: 'Salary Certificate',
    icon: <DollarSign className="w-5 h-5" />,
    fields: ['employeeName', 'salary', 'currency', 'position'],
    backgroundImage: '/templates/salary_background.png',
    component: SalaryTemplate
  }
};

// Helper function to get template component
export const getTemplateComponent = (templateKey: TemplateKey) => {
  return templates[templateKey]?.component;
};

// Helper function to get template fields
export const getTemplateFields = (templateKey: TemplateKey) => {
  return templates[templateKey]?.fields || [];
};

// Helper function to get template name
export const getTemplateName = (templateKey: TemplateKey) => {
  return templates[templateKey]?.name || '';
};
