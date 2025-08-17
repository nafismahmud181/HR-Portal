import React from 'react';

interface LOETemplateProps {
  formData: {
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
  };
  formatDate: (dateString: string) => string;
}

const LOETemplate: React.FC<LOETemplateProps> = ({ formData, formatDate }) => {
  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-xl font-bold mb-2">To Whom It May Concern:</h1>
      </div>
      
      <div className="text-left mb-4">
        <p className="mb-4">Dear Sir/Madam,</p>
        
        <p className="mb-4">
          This is to certify that {formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is an employee at {formData.companyName}, and {formData.employeeName ? 'he/she' : 'they'} has been working as a {formData.position} since {formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}. {formData.employeeName ? 'His/Her' : 'Their'} current salary is {formData.currency} {formData.salary || '[Salary Amount]'}, paid bi-weekly.
        </p>
        
        <p className="mb-4">
          If you have any questions regarding {formData.employeeName ? `${formData.employeeName}'s` : 'the employee\'s'} employment, please contact our office at {formData.contactPhone} or {formData.contactEmail}.
        </p>
      </div>
      
      <div className="text-left mt-8">
        {formData.signatureImage && (
          <div className="mb-4">
            <img 
              src={formData.signatureImage} 
              alt="Signature" 
              className="max-w-32 h-auto"
            />
          </div>
        )}
        <p className="font-semibold">{formData.signatoryName || '[Signatory Name]'}</p>
        <p>{formData.signatoryTitle}</p>
        <p>{formData.contactEmail}</p>
        <p>{formData.website}</p>
      </div>
    </div>
  );
};

export default LOETemplate;
