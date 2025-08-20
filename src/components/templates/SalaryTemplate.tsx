import React from 'react';

interface SalaryTemplateProps {
  formData: {
    employeeName: string;
    salary: string;
    currency: string;
    position: string;
    companyName: string;
    signatoryName: string;
    signatoryTitle: string;
    contactEmail: string;
    signatureImage?: string;
  };
}

const SalaryTemplate: React.FC<SalaryTemplateProps> = ({ formData }) => {
  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-3xl font-bold mb-2">SALARY CERTIFICATE</h1>
      </div>
      
      <div className="mb-4 text-left">
        <p className="mb-4">
          This is to certify that {formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} is currently employed with {formData.companyName} as {formData.position}.
        </p>
        
        <p className="mb-4">
          {formData.employeeName ? 'His/Her' : 'Their'} current monthly salary is {formData.currency} {formData.salary || '[Salary Amount]'}.
        </p>
        
        <p className="mb-4">
          This certificate is being issued upon {formData.employeeName ? 'his/her' : 'their'} request.
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

export default SalaryTemplate;
