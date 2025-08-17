import React from 'react';

interface ExperienceTemplateProps {
  formData: {
    employeeName: string;
    joiningDate: string;
    position: string;
    companyName: string;
    signatoryName: string;
    signatoryTitle: string;
    signatureImage?: string;
  };
  formatDate: (dateString: string) => string;
}

const ExperienceTemplate: React.FC<ExperienceTemplateProps> = ({ formData, formatDate }) => {
  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-xl font-bold mb-2">TO WHOM IT MAY CONCERN</h1>
      </div>
      
      <div className="mb-4 text-left">
        <p className="mb-4">
          This is to certify that {formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} has been working with {formData.companyName} as {formData.position} since {formData.joiningDate ? formatDate(formData.joiningDate) : '[Joining Date]'}.
        </p>
        
        <p className="mb-4">
          During {formData.employeeName ? 'his/her' : 'their'} tenure, {formData.employeeName ? 'he/she' : 'they'} has shown dedication, professionalism, and excellent work performance.
        </p>
        
        <p className="mb-4">
          We wish {formData.employeeName ? 'him/her' : 'them'} all the best for future endeavors.
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
      </div>
    </div>
  );
};

export default ExperienceTemplate;
