import React from 'react';

interface ReferenceTemplateProps {
  formData: {
    employeeName: string;
    position: string;
    companyName: string;
    signatoryName: string;
    signatoryTitle: string;
    contactEmail: string;
    signatureImage?: string;
  };
}

const ReferenceTemplate: React.FC<ReferenceTemplateProps> = ({ formData }) => {
  return (
    <div>
      <div className="text-left mb-6">
        <h1 className="text-xl font-bold mb-2">REFERENCE LETTER</h1>
      </div>
      
      <div className="mb-4 text-left">
        <p className="mb-4">
          This is to confirm that {formData.employeeName ? `Mr./Ms. ${formData.employeeName}` : '[Employee Name]'} has been employed with {formData.companyName} as {formData.position}.
        </p>
        
        <p className="mb-4">
          During {formData.employeeName ? 'his/her' : 'their'} employment, {formData.employeeName ? 'he/she' : 'they'} has demonstrated excellent professional skills, reliability, and dedication to {formData.employeeName ? 'his/her' : 'their'} work.
        </p>
        
        <p className="mb-4">
          We have no hesitation in recommending {formData.employeeName ? 'him/her' : 'them'} for any future employment opportunities.
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

export default ReferenceTemplate;
